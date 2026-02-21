# Getting Started

**Nylon Mesh** is a blazing-fast edge proxy built to solve the headaches of caching for modern SSR frameworks.

## Why Nylon Mesh?

Frameworks like **Next.js, Nuxt, React (SSR), Angular, and Vue** are powerful—but server-side rendering is computationally expensive. Running Node.js under heavy traffic without a dedicated caching layer leads to:

- 🔥 High CPU usage and slow TTFB
- 💥 Potential crashes under traffic spikes
- 😩 Complex custom caching logic inside your app

**Nylon Mesh sits in front of your app.** It intercepts HTTP requests, caches the expensive SSR-generated HTML in RAM and Redis, and serves subsequent users instantly—dropping your backend load to near zero.

## Installation

Nylon Mesh is written in **Rust** for maximum performance. Compile and run directly:

```bash
cargo build --release
```

Or install via npm into your project:

```bash
npm install nylon-mesh
```

## Initialization

Generate a ready-to-use configuration file:

```bash
bunx nylon-mesh init
```

This creates a `nylon-mesh.yaml` in your project folder. **No code changes required.**

## Running the Proxy

Start by pointing the proxy at your config:

```bash
cargo run --release -- nylon-mesh.yaml
```

Or via the CLI wrapper:

```bash
bunx nylon-mesh start nylon-mesh.yaml
```

::: tip 🎉 You're all set!
Traffic hitting port `3000` (default) is now being cached and routed to your backend efficiently. Check out the [Configuration](/configuration) to fine-tune your mesh.
:::
