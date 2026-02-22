use bytes::Bytes;
use http::StatusCode;
use pingora::Result;
use pingora::http::ResponseHeader;
use pingora_proxy::Session;

use super::MeshProxy;

impl MeshProxy {
    pub async fn serve_probe_response(
        session: &mut Session,
        status: StatusCode,
        msg: &'static str,
    ) -> Result<()> {
        let mut header = ResponseHeader::build(status, None).unwrap();
        let _ = header.insert_header("Content-Length", msg.len().to_string());
        session
            .write_response_header(Box::new(header), true)
            .await?;
        session
            .write_response_body(Some(Bytes::from(msg)), true)
            .await?;
        Ok(())
    }

    pub async fn handle_probes(&self, session: &mut Session, uri: &str) -> Result<Option<bool>> {
        if let Some(liveness_path) = &self.config.liveness_path {
            if uri == liveness_path {
                Self::serve_probe_response(session, StatusCode::OK, "OK").await?;
                return Ok(Some(true));
            }
        }

        if let Some(readiness_path) = &self.config.readiness_path {
            if uri == readiness_path {
                if crate::is_shutting_down() {
                    Self::serve_probe_response(
                        session,
                        StatusCode::SERVICE_UNAVAILABLE,
                        "Service is shutting down",
                    )
                    .await?;
                } else {
                    Self::serve_probe_response(session, StatusCode::OK, "OK").await?;
                }
                return Ok(Some(true));
            }
        }

        Ok(None)
    }

    pub fn should_bypass_cache(&self, method: &str, uri: &str) -> bool {
        if method != "GET" {
            return true;
        }

        if let Some(bypass) = &self.config.bypass {
            if let Some(paths) = &bypass.paths {
                for p in paths {
                    if uri.starts_with(p) {
                        return true;
                    }
                }
            }
            if let Some(exts) = &bypass.extensions {
                for ext in exts {
                    if uri.ends_with(ext) {
                        return true;
                    }
                }
            }
        }
        false
    }
}
