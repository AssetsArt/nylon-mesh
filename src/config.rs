use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub threads: Option<usize>,
    pub grace_period_seconds: Option<u64>,
    pub graceful_shutdown_timeout_seconds: Option<u64>,
    pub liveness_path: Option<String>,
    pub readiness_path: Option<String>,
    pub load_balancer_algo: Option<LoadBalancerAlgorithm>,
    pub listen: Option<String>,
    pub tls: Option<TlsConfig>,
    pub upstreams: Vec<UpstreamConfig>,
    pub redis_url: Option<String>,
    pub cache: Option<CacheConfig>,
    pub bypass: Option<BypassConfig>,
    pub cache_control: Option<Vec<CacheControlConfig>>,
    pub trusted_proxies: Option<Vec<ipnet::IpNet>>,
}

#[derive(Debug, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LoadBalancerAlgorithm {
    RoundRobin,
    Random,
}

#[derive(Debug, Deserialize, Clone)]
#[serde(untagged)]
pub enum UpstreamConfig {
    Simple(String),
    Weighted { address: String, weight: usize },
}

impl UpstreamConfig {
    pub fn address(&self) -> &str {
        match self {
            Self::Simple(addr) => addr,
            Self::Weighted { address, .. } => address,
        }
    }

    pub fn weight(&self) -> usize {
        match self {
            Self::Simple(_) => 1,
            Self::Weighted { weight, .. } => *weight,
        }
    }
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
    #[serde(alias = "t1_cap")]
    pub tier1_capacity: Option<u64>,
    #[serde(alias = "t1_ttl")]
    pub tier1_ttl_seconds: Option<u64>,
    #[serde(alias = "t2_ttl")]
    pub tier2_ttl_seconds: Option<u64>,
    pub max_cacheable_size_mb: Option<usize>,
    pub status: Option<Vec<u16>>,
    pub content_types: Option<Vec<String>>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct BypassConfig {
    pub paths: Option<Vec<String>>,
    #[serde(alias = "ext")]
    pub extensions: Option<Vec<String>>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct CacheControlConfig {
    pub value: String,
    pub paths: Option<Vec<String>>,
    #[serde(alias = "ext")]
    pub extensions: Option<Vec<String>>,
}

impl Config {
    pub fn load(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let f = std::fs::File::open(path)?;
        let config: Config = serde_yaml::from_reader(f)?;
        Ok(config)
    }
}
