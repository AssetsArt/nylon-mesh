use bytes::Bytes;
use http::StatusCode;
use pingora::Result;
use pingora::http::ResponseHeader;
use pingora_proxy::Session;
use serde::{Deserialize, Serialize};
use tracing::{debug, error};

use super::{MeshProxy, ProxyCtx};

static REDIS_CONN: tokio::sync::OnceCell<redis::aio::MultiplexedConnection> =
    tokio::sync::OnceCell::const_new();

pub async fn get_redis_conn(redis_url: &str) -> Option<redis::aio::MultiplexedConnection> {
    if redis_url.is_empty() {
        return None;
    }
    match REDIS_CONN
        .get_or_try_init(|| async {
            let client =
                redis::Client::open(redis_url).map_err(|e| format!("URL {}: {}", redis_url, e))?;
            client
                .get_multiplexed_async_connection()
                .await
                .map_err(|e| e.to_string())
        })
        .await
    {
        Ok(c) => Some(c.clone()),
        Err(e) => {
            error!("Failed to init Redis: {}", e);
            None
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct CachedHeaders {
    pub status: u16,
    pub headers: Vec<(String, String)>,
    #[serde(default)]
    pub expires_at: u64,
}

impl MeshProxy {
    pub fn determine_encodings_to_check(&self, accept_encoding: &str) -> Vec<&'static str> {
        let mut check = Vec::new();
        if accept_encoding.contains("gzip") {
            check.push("gzip");
        }
        if accept_encoding.contains("zstd") {
            check.push("zstd");
        }
        if accept_encoding.contains("br") {
            check.push("br");
        }
        if accept_encoding.contains("deflate") {
            check.push("deflate");
        }
        check.push(""); // Fallback

        check.sort_by(|a, b| {
            let hit_a = self
                .encoding_hits
                .get(a)
                .map(|v| v.load(std::sync::atomic::Ordering::Relaxed))
                .unwrap_or(0);
            let hit_b = self
                .encoding_hits
                .get(b)
                .map(|v| v.load(std::sync::atomic::Ordering::Relaxed))
                .unwrap_or(0);
            hit_b.cmp(&hit_a) // Descending
        });
        check
    }

    pub async fn fetch_from_redis(
        &self,
        session: &mut Session,
        enc: &str,
        host: &str,
        cache_key: &str,
        redis_url: &str,
        now_secs: u64,
    ) -> Result<bool> {
        if let Some(mut conn) = get_redis_conn(redis_url).await {
            let sub_key = cache_key.strip_prefix(host).unwrap_or(cache_key);
            let headers_key = format!("{}:headers", sub_key);

            let mut pipe = redis::pipe();
            pipe.cmd("HGET")
                .arg(host)
                .arg(sub_key)
                .cmd("HGET")
                .arg(host)
                .arg(&headers_key);

            let query_result: redis::RedisResult<(Option<Vec<u8>>, Option<Vec<u8>>)> =
                pipe.query_async(&mut conn).await;

            if let Ok((Some(cached_payload), cached_headers_vec)) = query_result {
                let mut status_code = StatusCode::OK;
                let mut parsed_headers = Vec::new();
                let mut is_new_format = false;

                if let Some(headers_bytes) = cached_headers_vec {
                    if let Ok(headers_json) = String::from_utf8(headers_bytes) {
                        if let Ok(ch) = serde_json::from_str::<CachedHeaders>(&headers_json) {
                            if ch.expires_at > 0 && now_secs > ch.expires_at {
                                let mut del_pipe = redis::pipe();
                                del_pipe
                                    .cmd("HDEL")
                                    .arg(host)
                                    .arg(sub_key)
                                    .cmd("HDEL")
                                    .arg(host)
                                    .arg(&headers_key);
                                let _: redis::RedisResult<()> =
                                    del_pipe.query_async(&mut conn).await;
                                return Ok(false);
                            }
                            if let Ok(sc) = StatusCode::from_u16(ch.status) {
                                status_code = sc;
                            }
                            parsed_headers = ch.headers;
                            is_new_format = true;
                        }
                    }
                }

                debug!("Tier 2 HIT: {}", cache_key);
                if let Some(timestamp) = self.encoding_hits.get(enc) {
                    timestamp.store(now_secs, std::sync::atomic::Ordering::Relaxed);
                }

                let bytes = Bytes::from(cached_payload);

                if let Ok(mut header) = ResponseHeader::build(status_code, None) {
                    if is_new_format {
                        for (name, value) in parsed_headers {
                            if let (Ok(hname), Ok(hval)) = (
                                http::header::HeaderName::try_from(name.as_str()),
                                http::header::HeaderValue::try_from(value.as_str()),
                            ) {
                                let _ = header.insert_header(hname, hval);
                            }
                        }
                    } else {
                        let _ = header.insert_header("Content-Type", "text/html; charset=utf-8");
                        let _ = header.insert_header("Content-Length", bytes.len().to_string());
                    }

                    if !enc.is_empty() {
                        let _ = header.insert_header("Content-Encoding", enc);
                    }

                    self.tier1_cache
                        .insert(cache_key.to_string(), (header.clone(), bytes.clone()))
                        .await;
                    let _ = header.insert_header("X-Cache-Tier", "2");

                    let _ = session.write_response_header(Box::new(header), true).await;
                    let _ = session.write_response_body(Some(bytes), true).await;
                    return Ok(true);
                }
            }
        }
        Ok(false)
    }

    pub async fn fetch_from_cache(
        &self,
        session: &mut Session,
        ctx: &mut ProxyCtx,
        host: &str,
        uri: &str,
        query: &str,
        encodings_to_check: &[&'static str],
        now_secs: u64,
    ) -> Result<bool> {
        let base_cache_key = format!("{}{}{}", host, uri, query);

        for enc in encodings_to_check.iter() {
            let mut cache_key = base_cache_key.clone();
            if !enc.is_empty() {
                cache_key.push_str(&format!(":{}", enc));
            }
            ctx.cache_key = cache_key.clone();

            // let now = std::time::Instant::now();
            // Tier 1
            if let Some((mut header, body)) = self.tier1_cache.get(&cache_key).await {
                // println!("Tier 1 HIT: {:?}", now.elapsed());
                debug!("Tier 1 HIT: {}", cache_key);
                if let Some(timestamp) = self.encoding_hits.get(*enc) {
                    timestamp.store(now_secs, std::sync::atomic::Ordering::Relaxed);
                }

                let _ = header.insert_header("X-Cache-Tier", "1");
                session
                    .write_response_header(Box::new(header), true)
                    .await?;
                session.write_response_body(Some(body), true).await?;
                return Ok(true);
            }

            // Tier 2
            if let Some(redis_url) = &self.config.redis_url {
                if !redis_url.is_empty() {
                    if self
                        .fetch_from_redis(session, enc, host, &cache_key, redis_url, now_secs)
                        .await?
                    {
                        return Ok(true);
                    }
                }
            }
        }

        Ok(false)
    }

    pub fn spawn_cache_save(
        &self,
        host: String,
        cache_key: String,
        mut header: ResponseHeader,
        html_bytes: Bytes,
        redis_url_opt: Option<String>,
        t2_ttl: u64,
    ) {
        let _ = header.remove_header("Transfer-Encoding");
        let _ = header.insert_header("Content-Length", html_bytes.len().to_string());
        let _ = header.remove_header("Cache-Control");

        let content_encoding = header
            .headers
            .get("Content-Encoding")
            .map(|hv| hv.to_str().unwrap_or(""))
            .unwrap_or("")
            .to_string();

        let mut final_cache_key = cache_key;
        if !content_encoding.is_empty() {
            final_cache_key.push_str(&format!(":{}", content_encoding));
        }

        let sub_key = final_cache_key
            .strip_prefix(&host)
            .unwrap_or(&final_cache_key)
            .to_string();

        let tier1_cache = self.tier1_cache.clone();
        tokio::spawn(async move {
            tier1_cache
                .insert(
                    final_cache_key.clone(),
                    (header.clone(), html_bytes.clone()),
                )
                .await;

            if let Some(redis_url) = redis_url_opt {
                if !redis_url.is_empty() {
                    if let Some(mut conn) = get_redis_conn(&redis_url).await {
                        let mut headers_vec = Vec::new();
                        for (name, value) in header.headers.iter() {
                            if let Ok(value_str) = value.to_str() {
                                headers_vec
                                    .push((name.as_str().to_string(), value_str.to_string()));
                            }
                        }

                        let now_secs = std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or(std::time::Duration::from_secs(0))
                            .as_secs();

                        let cached_headers = CachedHeaders {
                            status: header.status.as_u16(),
                            headers: headers_vec,
                            expires_at: now_secs + t2_ttl,
                        };

                        let html_vec: Vec<u8> = html_bytes.into();
                        if let Ok(headers_json) = serde_json::to_string(&cached_headers) {
                            let headers_key = format!("{}:headers", sub_key);
                            let mut pipe = redis::pipe();
                            pipe.cmd("HSET")
                                .arg(&host)
                                .arg(&sub_key)
                                .arg(html_vec)
                                .cmd("HSET")
                                .arg(&host)
                                .arg(&headers_key)
                                .arg(headers_json);
                            let _: redis::RedisResult<()> = pipe.query_async(&mut conn).await;
                        }
                    }
                }
            }
        });
    }
}
