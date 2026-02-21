use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub listen: Option<String>,
    pub tls: Option<TlsConfig>,
    pub upstreams: Vec<String>,
    pub redis_url: Option<String>,
    pub cache: Option<CacheConfig>,
    pub bypass: Option<BypassConfig>,
    pub plugins: Option<Vec<PluginConfig>>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct TlsConfig {
    pub listen: String,
    pub certs: Vec<CertificateConfig>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct CertificateConfig {
    pub host: String, // e.g., "*.example.com" or "example.com" or "default"
    pub cert_path: String,
    pub key_path: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct CacheConfig {
    pub tier1_capacity: Option<u64>,
    pub tier1_ttl_seconds: Option<u64>,
    pub tier2_ttl_seconds: Option<u64>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct BypassConfig {
    pub paths: Option<Vec<String>>,
    pub extensions: Option<Vec<String>>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct PluginConfig {
    pub name: String,
    pub file: String,
    pub host: Option<String>,
    pub path: Option<String>,
}

impl Config {
    pub fn load(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let f = std::fs::File::open(path)?;
        let config: Config = serde_yaml::from_reader(f)?;
        Ok(config)
    }
}
