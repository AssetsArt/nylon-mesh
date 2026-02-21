pub mod config;
pub mod proxy;
pub mod tls_accept;

use nylon_ring_host::NylonRingHost;
use pingora_core::server::Server;
use pingora_core::server::configuration::{Opt, ServerConf};
use pingora_load_balancing::LoadBalancer;
use pingora_proxy::http_proxy_service;
use std::env;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{error, info};

use config::Config;
use proxy::MeshProxy;

fn main() {
    tracing_subscriber::fmt().init();

    let args: Vec<String> = env::args().collect();
    let config_path = if args.len() > 1 {
        &args[1]
    } else {
        "nylon-mesh.yaml"
    };

    info!("Loading config from: {}", config_path);
    let config = match Config::load(config_path) {
        Ok(c) => Arc::new(c),
        Err(e) => {
            error!("Failed to load config: {}", e);
            std::process::exit(1);
        }
    };

    let mut pingora_upstreams = Vec::new();
    for u in config.upstreams.iter() {
        match pingora_load_balancing::Backend::new_with_weight(u.address(), u.weight()) {
            Ok(b) => pingora_upstreams.push(b),
            Err(e) => error!("Failed to parse upstream {}: {}", u.address(), e),
        }
    }

    if pingora_upstreams.is_empty() {
        error!("No upstreams configured in YAML.");
        std::process::exit(1);
    }

    // Prepare discovery and backend manager
    let discovery = pingora_load_balancing::discovery::Static::new(
        pingora_upstreams
            .into_iter()
            .collect::<std::collections::BTreeSet<_>>(),
    );
    let backends = pingora_load_balancing::Backends::new(discovery);

    // print!("config: {:?}", config);
    let load_balancer = match config
        .load_balancer_algo
        .as_ref()
        .unwrap_or(&crate::config::LoadBalancerAlgorithm::RoundRobin)
    {
        crate::config::LoadBalancerAlgorithm::RoundRobin => {
            let lb = LoadBalancer::<pingora_load_balancing::selection::RoundRobin>::from_backends(
                backends,
            );
            proxy::MeshLoadBalancer::RoundRobin(Arc::new(lb))
        }
        crate::config::LoadBalancerAlgorithm::Random => {
            let lb =
                LoadBalancer::<pingora_load_balancing::selection::Random>::from_backends(backends);
            proxy::MeshLoadBalancer::Random(Arc::new(lb))
        }
    };

    // Initialize Plugin Host
    let mut plugin_host = NylonRingHost::new();
    if let Some(plugins) = &config.plugins {
        for p in plugins {
            info!("Loading plugin: {} from {}", p.name, p.file);
            if let Err(e) = plugin_host.load(&p.name, &p.file) {
                error!("Failed to load plugin {}: {}", p.name, e);
            }
        }
    }

    let tier1_capacity = config
        .cache
        .as_ref()
        .and_then(|c| c.tier1_capacity)
        .unwrap_or(10000);
    let tier1_ttl = config
        .cache
        .as_ref()
        .and_then(|c| c.tier1_ttl_seconds)
        .unwrap_or(3);
    let tier1_cache = moka::future::Cache::builder()
        .max_capacity(tier1_capacity as u64)
        .time_to_live(std::time::Duration::from_secs(tier1_ttl as u64))
        .build();

    let proxy = MeshProxy {
        config: config.clone(),
        load_balancer: Arc::new(load_balancer),
        plugin_host: Arc::new(RwLock::new(plugin_host)),
        tier1_cache,
    };

    let opt = Opt::parse_args();
    let mut server = Server::new(Some(opt)).unwrap_or_else(|e| {
        error!("Failed to initialize Pingora Server: {}", e);
        std::process::exit(1);
    });

    server.configuration = Arc::new(ServerConf {
        daemon: false,
        threads: 10,
        ..Default::default()
    });
    server.bootstrap();

    let mut proxy_service = http_proxy_service(&server.configuration, proxy);

    // Setup Listeners
    if let Some(listen_addr) = &config.listen {
        info!("Adding plain HTTP listener on {}", listen_addr);
        proxy_service.add_tcp(listen_addr);
    }

    if let Some(tls) = &config.tls {
        info!("Adding TLS listener on {}", tls.listen);
        match tls_accept::new_tls_settings(tls.certs.clone()) {
            Ok(settings) => {
                proxy_service.add_tls_with_settings(&tls.listen, None, settings);
            }
            Err(e) => {
                error!("Failed to create TLS settings: {:?}", e);
                std::process::exit(1);
            }
        }
    }

    server.add_service(proxy_service);
    info!("Starting nylon-mesh proxy server...");
    server.run_forever();
}
