# Load Balancing

Nylon Mesh uses Pingora's production-proven load balancing logic, ensuring each incoming HTTP request is routed to an upstream gracefully and efficiently.

## Selection Algorithms
Determines how incoming traffic is distributed across the available backend pool:
- `round_robin` (Default): Distributes traffic sequentially and equally to the upstreams.
- `random`: Randomly assigns traffic to the available upstream servers.

**Example Configuration:**
```yaml
load_balancer_algo: "round_robin"
```

---

## Defining Upstreams

You can configure target backends (`upstreams`) flexibly, supporting both simple endpoints and heavily tailored active weights.

### Simple Configuration
Just provide the IP/Domain and Port of the target server:

```yaml
upstreams:
  - "127.0.0.1:3001"
  - "127.0.0.1:3002"
```

### Weighted Configuration
For backend servers equipped with superior hardware (CPU/RAM) relative to the rest of the pool, you can explicitly configure a higher `weight` to ensure they handle a larger slice of traffic.

```yaml
upstreams:
  - address: "127.0.0.1:3001"
    weight: 10
  - address: "127.0.0.1:3002"
    weight: 2
```
In the example above, for every `12` requests, the first server will handle `10`, while the second server manages `2`.

---

## Health Probes
Integrated support for Liveness and Readiness Endpoints, ensuring orchestration frameworks like Kubernetes can continuously monitor proxy health.

```yaml
liveness_path: "/_health/live"
readiness_path: "/_health/ready"
grace_period_seconds: 0
graceful_shutdown_timeout_seconds: 0
```

- **Liveness** (`/_health/live`): Continuously checked to verify the proxy process is healthy. Replies with HTTP Status 200 "OK".
- **Readiness** (`/_health/ready`): Used to verify the proxy is fully initialized and ready to receive real traffic. Also intercepts Graceful Shutdown statuses, changing the HTTP code appropriately to drain outstanding connections.
