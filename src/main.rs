#[cfg(not(debug_assertions))]
use mimalloc::MiMalloc;

#[cfg(not(debug_assertions))]
#[global_allocator]
static GLOBAL: MiMalloc = MiMalloc;

pub mod config;
pub mod proxy;
pub mod tls_accept;

use pingora_core::server::Server;
use pingora_core::server::configuration::{Opt, ServerConf};
use pingora_load_balancing::LoadBalancer;
use pingora_proxy::http_proxy_service;
use std::sync::Arc;
use tracing::{error, info};

use config::Config;
use proxy::MeshProxy;

use std::sync::atomic::{AtomicBool, Ordering};
use tokio::signal;

pub static IS_SHUTTING_DOWN: AtomicBool = AtomicBool::new(false);

pub fn is_shutting_down() -> bool {
    IS_SHUTTING_DOWN.load(Ordering::SeqCst)
}

// SIGTERM
async fn try_shutdown() -> std::io::Result<()> {
    #[cfg(unix)]
    if let Ok(mut stream) = signal::unix::signal(signal::unix::SignalKind::terminate()) {
        stream.recv().await;
    }
    Ok(())
}

async fn shutdown(shutdown_timeout: u64) {
    println!("\n🛑 Shutting down...");
    IS_SHUTTING_DOWN.store(true, Ordering::SeqCst);
    // countdown
    for i in (0..shutdown_timeout).rev() {
        println!("Shutting down in {} seconds", i);
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    }
}

fn main() {
    tracing_subscriber::fmt().init();

    let opt = Opt::parse_args();
    let config_path = opt.conf.as_deref().unwrap_or("nylon-mesh.yaml");

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
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(lb.update()).unwrap();
            proxy::MeshLoadBalancer::RoundRobin(Arc::new(lb))
        }
        crate::config::LoadBalancerAlgorithm::Random => {
            let lb =
                LoadBalancer::<pingora_load_balancing::selection::Random>::from_backends(backends);
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(lb.update()).unwrap();
            proxy::MeshLoadBalancer::Random(Arc::new(lb))
        }
    };

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

    let mut encoding_hits = std::collections::HashMap::new();
    encoding_hits.insert("zstd", std::sync::atomic::AtomicU64::new(0));
    encoding_hits.insert("br", std::sync::atomic::AtomicU64::new(0));
    encoding_hits.insert("gzip", std::sync::atomic::AtomicU64::new(0));
    encoding_hits.insert("deflate", std::sync::atomic::AtomicU64::new(0));

    let proxy = MeshProxy {
        config: config.clone(),
        load_balancer: Arc::new(load_balancer),
        tier1_cache,
        encoding_hits: Arc::new(encoding_hits),
    };

    let mut server = Server::new(Some(opt)).unwrap_or_else(|e| {
        error!("Failed to initialize Pingora Server: {}", e);
        std::process::exit(1);
    });

    let threads = config.threads.unwrap_or_else(|| {
        std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(1)
    });

    let grace_period_seconds = config.grace_period_seconds.unwrap_or(0);
    let graceful_shutdown_timeout_seconds = config.graceful_shutdown_timeout_seconds.unwrap_or(0);

    server.configuration = Arc::new(ServerConf {
        daemon: false,
        grace_period_seconds: Some(grace_period_seconds),
        graceful_shutdown_timeout_seconds: Some(graceful_shutdown_timeout_seconds),
        threads,
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

    let shutdown_timeout = config.graceful_shutdown_timeout_seconds.unwrap_or(0);
    std::thread::spawn(move || {
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();

        rt.block_on(async move {
            // Wait for shutdown signal
            tokio::select! {
                _ = signal::ctrl_c() => {
                    println!("From ctrl_c");
                    shutdown(shutdown_timeout).await;
                },
                _ = try_shutdown() => {
                    println!("From try_shutdown");
                    shutdown(shutdown_timeout).await;
                },
            }
            println!("✅ Shutdown complete");
        });
    });

    info!("Starting nylon-mesh proxy server...");
    server.run_forever();
}
