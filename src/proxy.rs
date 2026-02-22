use async_trait::async_trait;
use bytes::Bytes;
use http::StatusCode;
use moka::future::Cache;
use pingora::Result;
use pingora::http::ResponseHeader;
use pingora::upstreams::peer::HttpPeer;
use pingora_load_balancing::{
    LoadBalancer,
    selection::{Random, RoundRobin},
};
use pingora_proxy::{ProxyHttp, Session};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::Duration;
use tracing::{debug, error};

use crate::config::Config;

static REDIS_CONN: tokio::sync::OnceCell<redis::aio::MultiplexedConnection> =
    tokio::sync::OnceCell::const_new();

async fn get_redis_conn(redis_url: &str) -> Option<redis::aio::MultiplexedConnection> {
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

pub enum MeshLoadBalancer {
    RoundRobin(Arc<LoadBalancer<RoundRobin>>),
    Random(Arc<LoadBalancer<Random>>),
}

impl MeshLoadBalancer {
    pub fn select(
        &self,
        key: &[u8],
        max_iterations: usize,
    ) -> Option<pingora_load_balancing::Backend> {
        match self {
            Self::RoundRobin(lb) => lb.select(key, max_iterations),
            Self::Random(lb) => lb.select(key, max_iterations),
        }
    }
}

#[derive(Serialize, Deserialize)]
struct CachedHeaders {
    status: u16,
    headers: Vec<(String, String)>,
}

pub struct MeshProxy {
    pub config: Arc<Config>,
    pub load_balancer: Arc<MeshLoadBalancer>,
    pub tier1_cache: Cache<String, (ResponseHeader, Bytes)>,
    pub encoding_hits: Arc<std::collections::HashMap<&'static str, std::sync::atomic::AtomicU64>>,
}

pub struct ProxyCtx {
    should_cache: bool,
    cache_key: String,
    response_body: Vec<u8>,
    response_header: Option<ResponseHeader>,
}

#[async_trait]
impl ProxyHttp for MeshProxy {
    type CTX = ProxyCtx;

    fn new_ctx(&self) -> Self::CTX {
        ProxyCtx {
            should_cache: false,
            cache_key: String::new(),
            response_body: Vec::new(),
            response_header: None,
        }
    }

    async fn upstream_peer(
        &self,
        _session: &mut Session,
        _ctx: &mut Self::CTX,
    ) -> Result<Box<HttpPeer>> {
        let upstream = self
            .load_balancer
            .select(b"", 256) // Use empty hash for round robin
            .ok_or_else(|| {
                pingora::Error::explain(
                    pingora::ErrorType::HTTPStatus(502),
                    "No upstream available",
                )
            })?;

        let peer = HttpPeer::new(upstream.clone(), false, String::new());
        Ok(Box::new(peer))
    }

    async fn request_filter(&self, session: &mut Session, ctx: &mut Self::CTX) -> Result<bool> {
        let req_header = session.req_header();
        let uri = req_header.uri.path();

        // Liveness probe
        if let Some(liveness_path) = &self.config.liveness_path
            && uri == liveness_path
        {
            let mut header = ResponseHeader::build(StatusCode::OK, None).unwrap();
            let _ = header.insert_header("Content-Length", "2");
            session
                .write_response_header(Box::new(header), true)
                .await?;
            session
                .write_response_body(Some(Bytes::from("OK")), true)
                .await?;
            return Ok(true);
        }

        // Readiness probe
        if let Some(readiness_path) = &self.config.readiness_path
            && uri == readiness_path
        {
            if crate::is_shutting_down() {
                let msg = "Service is shutting down";
                let mut header =
                    ResponseHeader::build(StatusCode::SERVICE_UNAVAILABLE, None).unwrap();
                let _ = header.insert_header("Content-Length", msg.len().to_string());
                session
                    .write_response_header(Box::new(header), true)
                    .await?;
                session
                    .write_response_body(Some(Bytes::from(msg)), true)
                    .await?;
            } else {
                let mut header = ResponseHeader::build(StatusCode::OK, None).unwrap();
                let _ = header.insert_header("Content-Length", "2");
                session
                    .write_response_header(Box::new(header), true)
                    .await?;
                session
                    .write_response_body(Some(Bytes::from("OK")), true)
                    .await?;
            }
            return Ok(true);
        }

        let host = req_header
            .headers
            .get("Host")
            .map(|v| v.to_str().unwrap_or("localhost"))
            .unwrap_or("localhost");

        // Cache bypass logic
        let mut bypass_cache = false;
        if req_header.method.as_str() != "GET" {
            bypass_cache = true;
        }

        if let Some(bypass) = &self.config.bypass {
            if let Some(paths) = &bypass.paths {
                for p in paths {
                    if uri.starts_with(p) {
                        bypass_cache = true;
                    }
                }
            }
            if let Some(exts) = &bypass.extensions {
                for ext in exts {
                    if uri.ends_with(ext) {
                        bypass_cache = true;
                    }
                }
            }
        }

        if bypass_cache {
            return Ok(false);
        }

        let accept_encoding = req_header
            .headers
            .get("accept-encoding")
            .map(|hv| hv.to_str().unwrap_or(""))
            .unwrap_or("");

        let mut encodings_to_check = Vec::new();
        if accept_encoding.contains("gzip") {
            encodings_to_check.push("gzip");
        }
        if accept_encoding.contains("zstd") {
            encodings_to_check.push("zstd");
        }
        if accept_encoding.contains("br") {
            encodings_to_check.push("br");
        }
        if accept_encoding.contains("deflate") {
            encodings_to_check.push("deflate");
        }
        encodings_to_check.push(""); // Always check uncompressed as fallback

        // Sort encodings based on last hit time (newest hits first)
        encodings_to_check.sort_by(|a, b| {
            let hit_time_a = self
                .encoding_hits
                .get(a)
                .map(|v| v.load(std::sync::atomic::Ordering::Relaxed))
                .unwrap_or(0);
            let hit_time_b = self
                .encoding_hits
                .get(b)
                .map(|v| v.load(std::sync::atomic::Ordering::Relaxed))
                .unwrap_or(0);
            hit_time_b.cmp(&hit_time_a) // Descending order (newest first)
        });

        let query = req_header
            .uri
            .query()
            .map_or(String::new(), |q| format!("?{}", q));
        let base_cache_key = format!("{}{}{}", host, uri, query);

        let now_secs = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or(std::time::Duration::from_secs(0))
            .as_secs();

        for enc in encodings_to_check.iter() {
            let mut cache_key = base_cache_key.clone();
            if !enc.is_empty() {
                cache_key.push_str(&format!(":{}", enc));
            }
            ctx.cache_key = cache_key.clone(); // The last one (which is "") will be used for upstream proxying cache miss

            // Tier 1 LRU
            if let Some((mut header, body)) = self.tier1_cache.get(&cache_key).await {
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

            // Tier 2 Redis (Only if redis_url is configured)
            if let Some(redis_url) = &self.config.redis_url {
                if !redis_url.is_empty() {
                    if let Some(mut conn) = get_redis_conn(redis_url).await {
                        let headers_key = format!("{}:headers", cache_key);
                        let mut pipe = redis::pipe();
                        pipe.get(&cache_key).get(&headers_key);

                        let query_result: redis::RedisResult<(Option<Vec<u8>>, Option<Vec<u8>>)> =
                            pipe.query_async(&mut conn).await;

                        if let Ok((Some(cached_payload), cached_headers_vec)) = query_result {
                            debug!("Tier 2 HIT: {}", cache_key);
                            if let Some(timestamp) = self.encoding_hits.get(*enc) {
                                timestamp.store(now_secs, std::sync::atomic::Ordering::Relaxed);
                            }

                            let mut status_code = StatusCode::OK;
                            let mut parsed_headers = Vec::new();
                            let mut is_new_format = false;

                            if let Some(headers_bytes) = cached_headers_vec {
                                if let Ok(headers_json) = String::from_utf8(headers_bytes) {
                                    if let Ok(ch) =
                                        serde_json::from_str::<CachedHeaders>(&headers_json)
                                    {
                                        if let Ok(sc) = StatusCode::from_u16(ch.status) {
                                            status_code = sc;
                                        }
                                        parsed_headers = ch.headers;
                                        is_new_format = true;
                                    }
                                }
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
                                    let _ = header
                                        .insert_header("Content-Type", "text/html; charset=utf-8");
                                    let _ = header
                                        .insert_header("Content-Length", bytes.len().to_string());
                                }

                                if !enc.is_empty() {
                                    let _ = header.insert_header("Content-Encoding", *enc);
                                }

                                self.tier1_cache
                                    .insert(cache_key.clone(), (header.clone(), bytes.clone()))
                                    .await;
                                let _ = header.insert_header("X-Cache-Tier", "2");

                                let _ = session.write_response_header(Box::new(header), true).await;
                                let _ = session.write_response_body(Some(bytes), true).await;
                                return Ok(true);
                            }
                        }
                    }
                }
            }
        }

        Ok(false)
    }

    async fn response_filter(
        &self,
        session: &mut Session,
        resp: &mut ResponseHeader,
        ctx: &mut Self::CTX,
    ) -> Result<()> {
        let req_uri = session.req_header().uri.path();

        if let Some(rules) = &self.config.cache_control {
            for rule in rules {
                let mut matches = false;
                if let Some(paths) = &rule.paths {
                    for p in paths {
                        if req_uri.starts_with(p) {
                            matches = true;
                            break;
                        }
                    }
                }
                if !matches {
                    if let Some(exts) = &rule.extensions {
                        for ext in exts {
                            if req_uri.ends_with(ext) {
                                matches = true;
                                break;
                            }
                        }
                    }
                }
                if matches {
                    let _ = resp.remove_header("Cache-Control");
                    let _ = resp.insert_header("Cache-Control", &rule.value);
                    break;
                }
            }
        }

        let content_type = resp
            .headers
            .get("Content-Type")
            .map(|hv| hv.to_str().unwrap_or(""))
            .unwrap_or("");

        if resp.status.as_u16() == 200
            && content_type.contains("text/html")
            && !ctx.cache_key.is_empty()
        {
            ctx.should_cache = true;
            ctx.response_header = Some(resp.clone());
        }

        Ok(())
    }

    fn response_body_filter(
        &self,
        _session: &mut Session,
        body: &mut Option<Bytes>,
        end_of_stream: bool,
        ctx: &mut Self::CTX,
    ) -> Result<Option<Duration>> {
        if ctx.should_cache {
            if let Some(b) = body {
                ctx.response_body.extend_from_slice(b);
            }

            if end_of_stream {
                let mut cache_key = ctx.cache_key.clone();
                let html_bytes = Bytes::from(ctx.response_body.clone());
                let redis_url_opt = self.config.redis_url.clone();
                let t2_ttl = self
                    .config
                    .cache
                    .as_ref()
                    .and_then(|c| c.tier2_ttl_seconds)
                    .unwrap_or(60);

                if let Some(mut header) = ctx.response_header.clone() {
                    // transfer-encoding
                    let _ = header.remove_header("Transfer-Encoding");
                    let _ = header.insert_header("Content-Length", html_bytes.len().to_string());

                    let content_encoding = header
                        .headers
                        .get("Content-Encoding")
                        .map(|hv| hv.to_str().unwrap_or(""))
                        .unwrap_or("");

                    if !content_encoding.is_empty() {
                        cache_key.push_str(&format!(":{}", content_encoding));
                    }

                    let tier1_cache = self.tier1_cache.clone();
                    tokio::spawn(async move {
                        tier1_cache
                            .insert(cache_key.clone(), (header.clone(), html_bytes.clone()))
                            .await;

                        if let Some(redis_url) = redis_url_opt {
                            if !redis_url.is_empty() {
                                if let Some(mut conn) = get_redis_conn(&redis_url).await {
                                    let mut headers_vec = Vec::new();
                                    for (name, value) in header.headers.iter() {
                                        if let Ok(value_str) = value.to_str() {
                                            headers_vec.push((
                                                name.as_str().to_string(),
                                                value_str.to_string(),
                                            ));
                                        }
                                    }

                                    let cached_headers = CachedHeaders {
                                        status: header.status.as_u16(),
                                        headers: headers_vec,
                                    };

                                    let html_vec: Vec<u8> = html_bytes.into();
                                    if let Ok(headers_json) = serde_json::to_string(&cached_headers)
                                    {
                                        let headers_key = format!("{}:headers", cache_key);
                                        let mut pipe = redis::pipe();
                                        pipe.cmd("SETEX")
                                            .arg(&cache_key)
                                            .arg(t2_ttl)
                                            .arg(html_vec)
                                            .cmd("SETEX")
                                            .arg(&headers_key)
                                            .arg(t2_ttl)
                                            .arg(headers_json);
                                        let _: redis::RedisResult<()> =
                                            pipe.query_async(&mut conn).await;
                                    }
                                }
                            }
                        }
                    });
                }
            }
        }
        Ok(None)
    }
}
