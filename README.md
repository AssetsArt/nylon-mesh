<div align="center">

# 🕸️ Nylon Mesh

**Cache Everything. Scale Instantly.**

[![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

*A blazing-fast edge proxy built to solve the headaches of caching for modern SSR frameworks.*

[Why Nylon Mesh?](#why-nylon-mesh) • [Features](#key-features) • [Quick Start](#installation) • [Configuration](#configuration-example-nylon-meshyaml)

<br/>

![Nylon Mesh Demo](https://github.com/AssetsArt/nylon-mesh/blob/main/docs/demo.gif?raw=true)

</div>



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

The fastest way to install Nylon Mesh globally is via our official installation script:

```bash
curl -fsSL https://mesh.nylon.sh/install | bash
```

Alternatively, you can execute the initialization directly using your favorite package manager (no installation required):

```bash
bunx nylon-mesh@latest init
```

```bash
pnpx nylon-mesh@latest init
```

```bash
npx nylon-mesh@latest init
```

Or you can compile and run directly from source:

```bash
cargo build --release
```

## Initialization

If you installed Nylon Mesh globally, generate a ready-to-use configuration file in your project:

```bash
nylon-mesh init
```

This creates a `nylon-mesh.yaml` in your project folder. **No code changes are required in your application.**

## Running the Proxy

Start by pointing the proxy at your generated config file:

```bash
cargo run --release -- start -c nylon-mesh.yaml
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
  t1_cap: 100000 
  t1_ttl: 3 
  t2_ttl: 30
  status: [200, 404]
  content_types:
    - "text/html"

bypass:
  paths:
    - "/_next/"
    - "/api/"
  ext:
    - ".ico"
    - ".png"
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
