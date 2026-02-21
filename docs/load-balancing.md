# Load Balancing

Nylon Mesh uses [Pingora's](https://github.com/cloudflare/pingora) production-proven load balancing engine to route incoming HTTP requests across your upstream pool.

## Selection Algorithms

| Algorithm | Behavior |
|---|---|
| `round_robin` **(default)** | Distributes traffic sequentially and equally across upstreams. |
| `random` | Randomly assigns each request to an available upstream. |

```yaml
load_balancer_algo: "round_robin"
```

---

## Defining Upstreams

### Simple Configuration

Just provide the address and port of each backend:

```yaml
upstreams:
  - "127.0.0.1:3001"
  - "127.0.0.1:3002"
```

### Weighted Configuration

For backends with different hardware capabilities, assign `weight` to route proportionally more traffic:

```yaml
upstreams:
  - address: "127.0.0.1:3001"
    weight: 10
  - address: "127.0.0.1:3002"
    weight: 2
```

::: tip
In this example, for every **12** requests the first server handles **10** while the second manages **2**. Use this to route more traffic to machines with stronger CPU/RAM.
:::

---

## Health Probes

Integrated Liveness and Readiness endpoints for orchestration platforms like Kubernetes:

```yaml
liveness_path: "/_health/live"
readiness_path: "/_health/ready"
grace_period_seconds: 0
graceful_shutdown_timeout_seconds: 0
```

| Probe | Path | Behavior |
|---|---|---|
| **Liveness** | `/_health/live` | Returns `200 OK` while the proxy process is healthy. |
| **Readiness** | `/_health/ready` | Returns `200 OK` when ready to receive traffic. Returns `503` during graceful shutdown to drain connections. |

::: warning
Health probe paths are handled natively by Nylon Mesh and **never** forwarded to your backend. Make sure these paths don't conflict with your application routes.
:::
