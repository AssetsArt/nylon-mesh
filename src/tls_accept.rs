use async_trait::async_trait;
use openssl::{pkey::PKey, ssl::NameType, x509::X509};
use pingora::{
    listeners::{TlsAccept, tls::TlsSettings},
    tls::ext,
};
use std::collections::HashMap;
use tracing::error;

pub struct TlsCertificate {
    cert: X509,
    key: PKey<openssl::pkey::Private>,
    chain: Vec<X509>,
}

pub struct DynamicCertificate {
    // Maps SNI hostname to certificate
    certs: HashMap<String, TlsCertificate>,
    default_cert: Option<TlsCertificate>,
}

impl DynamicCertificate {
    pub fn new() -> Self {
        Self {
            certs: HashMap::new(),
            default_cert: None,
        }
    }
}

pub fn new_tls_settings(
    certs_config: Vec<crate::config::CertificateConfig>,
) -> Result<TlsSettings, Box<pingora_core::BError>> {
    let mut dynamic_cert = DynamicCertificate::new();

    for cfg in certs_config {
        let cert_pem = std::fs::read(&cfg.cert_path).map_err(|e| {
            pingora_core::Error::because(
                pingora_core::ErrorType::Custom("TLSConfError"),
                format!("Failed to read cert file {}: {}", cfg.cert_path, e),
                e,
            )
        })?;
        let key_pem = std::fs::read(&cfg.key_path).map_err(|e| {
            pingora_core::Error::because(
                pingora_core::ErrorType::Custom("TLSConfError"),
                format!("Failed to read key file {}: {}", cfg.key_path, e),
                e,
            )
        })?;

        let cert = X509::from_pem(&cert_pem).map_err(|e| {
            pingora_core::Error::because(
                pingora_core::ErrorType::Custom("TLSConfError"),
                "Failed to parse cert",
                e,
            )
        })?;
        let key = PKey::private_key_from_pem(&key_pem).map_err(|e| {
            pingora_core::Error::because(
                pingora_core::ErrorType::Custom("TLSConfError"),
                "Failed to parse private key",
                e,
            )
        })?;

        let tls_cert = TlsCertificate {
            cert,
            key,
            chain: vec![], // Extend logic later to handle fullchains if necessary
        };

        if cfg.host == "default" {
            dynamic_cert.default_cert = Some(tls_cert);
        } else {
            dynamic_cert.certs.insert(cfg.host, tls_cert);
        }
    }

    let tls =
        TlsSettings::with_callbacks(Box::new(dynamic_cert)).map_err(|e: Box<pingora::Error>| {
            pingora_core::Error::because(
                pingora_core::ErrorType::Custom("TLSConfError"),
                "TlsSettings wrapper error",
                e,
            )
        })?;
    Ok(tls)
}

#[async_trait]
impl TlsAccept for DynamicCertificate {
    async fn certificate_callback(&self, ssl: &mut pingora::protocols::tls::TlsRef) {
        let server_name = ssl.servername(NameType::HOST_NAME).unwrap_or("localhost");

        let cert_info = if let Some(cert) = self.certs.get(server_name) {
            cert
        } else if let Some(cert) = &self.default_cert {
            cert
        } else {
            error!("No certificate found for SNI: {}", server_name);
            return;
        };

        if let Err(e) = ext::ssl_use_certificate(ssl, &cert_info.cert) {
            error!("Failed to use certificate: {}", e);
        }

        if let Err(e) = ext::ssl_use_private_key(ssl, &cert_info.key) {
            error!("Failed to use private key: {}", e);
        }

        for chain_cert in &cert_info.chain {
            if let Err(e) = ext::ssl_add_chain_cert(ssl, chain_cert) {
                error!("Failed to add chain certificate: {}", e);
            }
        }
    }
}
