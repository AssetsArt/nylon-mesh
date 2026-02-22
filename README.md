<div align="center">
  <strong>Nylon Mesh - Cache Everything. Scale Instantly.</strong>
</div>
<br/>

**Nylon Mesh** is a blazing-fast edge proxy built to solve the headaches of caching for modern SSR frameworks. Built with Rust and powered by Cloudflare's Pingora, it provides massive throughput with minimal resource footprint.

## Why Nylon Mesh?

Frameworks like **Next.js, Nuxt, React (SSR), Angular, and Vue** are powerful—but server-side rendering is computationally expensive. Running Node.js under heavy traffic without a dedicated caching layer leads to:

- High CPU usage and slow Time to First Byte (TTFB)
- Potential crashes under traffic spikes
- Complex custom caching logic inside your app

**Nylon Mesh sits in front of your app.** It intercepts HTTP requests, caches the expensive SSR-generated HTML in RAM (Tier 1) and Redis (Tier 2), and serves subsequent users instantly—dropping your backend load to near zero.

## Key Features

- ⚡️ **Blazing Fast**: Built in Rust on top of Pingora.
- 🚀 **Two-Tier Caching**: Uses a lightning-fast in-memory RAM cache (Tier-1) and falls back to Redis (Tier-2).
- ⚖️ **Load Balancing**: Built-in support for Round Robin and Weighted routing to multiple upstream servers.
- 🛠 **Zero-Code Integration**: Works with any backend by just placing it in front of your existing app. No SDKs needed.
- ⚙️ **Simple Configuration**: Easy to set up using a single YAML file.

## Installation

Nylon Mesh is written in **Rust** for maximum performance. You can compile and run it directly:

```bash
cargo build --release
```

Or install it via Bun into your Node.js project:

```bash
bun add nylon-mesh
```

## Initialization

Generate a ready-to-use configuration file in your project:

```bash
bunx nylon-mesh init
```

This creates a `nylon-mesh.yaml` in your project folder. **No code changes are required in your application.**

## Running the Proxy

Start by pointing the proxy at your generated config file:

```bash
cargo run --release -- nylon-mesh.yaml
```

Or via the CLI wrapper if installed via package manager:

```bash
bunx nylon-mesh start nylon-mesh.yaml
```

Traffic hitting port `3000` (default) is now being cached and routed to your backend efficiently!

## Configuration Example (`nylon-mesh.yaml`)

```yaml
listen: "0.0.0.0:3000"
upstreams:
  - "127.0.0.1:3001"
load_balancer_algo: "round_robin"
redis_url: "redis://localhost:6379"

cache:
  tier1_capacity: 10000
  tier1_ttl_seconds: 3
  tier2_ttl_seconds: 60
  status: [200, 404]
  content_types:
    - "text/html"

bypass:
  paths:
    - "/_next/"
    - "/api/"
  extensions:
    - ".ico"
    - ".png"
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
