pub mod cache;
pub mod handlers;
pub mod load_balancer;

pub use load_balancer::MeshLoadBalancer;

use async_trait::async_trait;
use bytes::Bytes;
use moka::future::Cache;
use pingora::Result;
use pingora::http::ResponseHeader;
use pingora::upstreams::peer::HttpPeer;
use pingora_proxy::{ProxyHttp, Session};
use std::sync::Arc;
use std::time::Duration;

use crate::config::Config;

pub struct MeshProxy {
    pub config: Arc<Config>,
    pub load_balancer: Arc<MeshLoadBalancer>,
    pub tier1_cache: Cache<String, (ResponseHeader, Bytes)>,
    pub encoding_hits: Arc<std::collections::HashMap<&'static str, std::sync::atomic::AtomicU64>>,
}

pub struct ProxyCtx {
    pub should_cache: bool,
    pub cache_key: String,
    pub host: String,
    pub response_body: Vec<u8>,
    pub response_header: Option<ResponseHeader>,
}

#[async_trait]
impl ProxyHttp for MeshProxy {
    type CTX = ProxyCtx;

    fn new_ctx(&self) -> Self::CTX {
        ProxyCtx {
            should_cache: false,
            cache_key: String::new(),
            host: String::new(),
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
        let uri = session.req_header().uri.path().to_string();

        if let Some(handled) = self.handle_probes(session, &uri).await? {
            return Ok(handled);
        }

        let method = session.req_header().method.as_str().to_string();

        if self.should_bypass_cache(&method, &uri) {
            return Ok(false);
        }

        let host = session
            .req_header()
            .headers
            .get("Host")
            .map(|v| v.to_str().unwrap_or("localhost"))
            .unwrap_or("localhost")
            .to_string();

        ctx.host = host.clone();

        let accept_encoding = session
            .req_header()
            .headers
            .get("accept-encoding")
            .map(|hv| hv.to_str().unwrap_or(""))
            .unwrap_or("")
            .to_string();

        let encodings_to_check = self.determine_encodings_to_check(&accept_encoding);
        let query = session
            .req_header()
            .uri
            .query()
            .map_or(String::new(), |q| format!("?{}", q));
        let now_secs = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or(std::time::Duration::from_secs(0))
            .as_secs();

        self.fetch_from_cache(
            session,
            ctx,
            &host,
            &uri,
            &query,
            &encodings_to_check,
            now_secs,
        )
        .await
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

        let default_statuses = vec![200];
        let default_content_types = vec!["text/html".to_string()];

        let valid_statuses = self
            .config
            .cache
            .as_ref()
            .and_then(|c| c.status.as_ref())
            .unwrap_or(&default_statuses);

        let valid_content_types = self
            .config
            .cache
            .as_ref()
            .and_then(|c| c.content_types.as_ref())
            .unwrap_or(&default_content_types);

        let has_valid_status = valid_statuses.contains(&resp.status.as_u16());
        let has_valid_content_type = valid_content_types
            .iter()
            .any(|ct| content_type.contains(ct));

        if has_valid_status && has_valid_content_type && !ctx.cache_key.is_empty() {
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
                let cache_key = ctx.cache_key.clone();
                let html_bytes = Bytes::from(ctx.response_body.clone());
                let redis_url_opt = self.config.redis_url.clone();
                let t2_ttl = self
                    .config
                    .cache
                    .as_ref()
                    .and_then(|c| c.tier2_ttl_seconds)
                    .unwrap_or(60);

                if let Some(header) = ctx.response_header.clone() {
                    let host = ctx.host.clone();
                    self.spawn_cache_save(
                        host,
                        cache_key,
                        header,
                        html_bytes,
                        redis_url_opt,
                        t2_ttl,
                    );
                }
            }
        }
        Ok(None)
    }
}
