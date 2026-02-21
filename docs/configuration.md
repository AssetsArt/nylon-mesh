# Configuration Options

Nylon Mesh is entirely declarative, meaning its behavior is controlled and managed primarily through a single YAML configuration file (typically `nylon-mesh.yaml`).

## Example `nylon-mesh.yaml`

```yaml
threads: 10
liveness_path: "/_health/live"
readiness_path: "/_health/ready"
grace_period_seconds: 0
graceful_shutdown_timeout_seconds: 0
listen: "0.0.0.0:3000"

upstreams:
  - "127.0.0.1:3001"
  - address: "127.0.0.1:3002"
    weight: 5

load_balancer_algo: "round_robin"
redis_url: "redis://localhost:6379"

cache:
  tier1_capacity: 10000
  tier1_ttl_seconds: 3
  tier2_ttl_seconds: 60

bypass:
  paths:
    - "/_next/"
    - "/api/"
  extensions:
    - ".ico"
    - ".png"

cache_control:
  - value: "public, max-age=31536000, immutable"
    paths:
      - "/_next/static/"
    extensions:
      - ".ico"
      - ".png"
      - ".jpg"
```

## Property Reference

| Property | Description | Type |
| --- | --- | --- |
| `threads` | Number of worker threads. If omitted, it defaults to the host CPU core count. | Integer |
| `listen` | IP and Port the proxy server binds to, e.g., `0.0.0.0:3000`. | String |
| `liveness_path` | URL path for Liveness Probes (e.g., in K8s). It responds with "OK". | String |
| `readiness_path` | URL path to verify if the application is ready to accept HTTP requests (e.g., K8s Readiness Probe). | String |
| `graceful_shutdown...` | Time in seconds to await active connections to finish before fully shutting down the process. | Integer |
| `upstreams` | Target backend servers. Learn more in the [Load Balancing](/load-balancing) section. | Array |
| `load_balancer_algo` | Request distribution strategy. Supports `round_robin` and `random`. | String |
| `redis_url` | Connection URL for Redis (used as the Tier 2 Cache storage layer). | String |
| `cache` | Settings for defining Capacity and Time-To-Live (TTL) for caching. | Object |
| `bypass` | Rules (paths/extensions) indicating which traffic should **never be cached (Cache Bypass)**. | Object |
| `cache_control` | Injects HTTP `Cache-Control` response headers enforcing cache policies to connecting clients/browsers. | Array |

## TLS / HTTPS Configuration

If you wish to terminate TLS directly at the proxy, append the following parameters to your configuration:

```yaml
tls:
  listen: "0.0.0.0:443"
  certs:
    - host: "default"
      cert_path: "cert.pem"
      key_path: "key.pem"
```
