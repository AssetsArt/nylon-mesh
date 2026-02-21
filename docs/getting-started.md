# Getting Started

**Nylon Mesh** is a blazing-fast edge proxy built specifically to solve the headaches of caching for modern Frontend and Server-Side Rendering (SSR) frameworks.

## Why Nylon Mesh?

Frameworks like **Next.js, Nuxt, React (SSR), Angular, and Vue** are powerful, but server-side rendering is computationally expensive. Running Node.js under heavy traffic without a dedicated caching layer often leads to high CPU usage, slow Time-to-First-Byte (TTFB), and potential crashes.

Instead of writing complex custom caching logic inside your application or struggling with CDN misconfigurations, **Nylon Mesh sits in front of your App**. It intercepts HTTP requests, caches the expensive SSR-generated HTML in RAM and Redis, and serves subsequent users instantly—dropping your backend load to near zero.

## Installation

Nylon Mesh is written in Rust for maximum performance. You can compile and run it directly using Cargo:

```bash
cargo build --release
```

Alternatively, if you're installing it into a Node.js monorepo or project via npm:

```bash
npm install nylon-mesh
```

## Initialization

Quickly generate an example configuration file specifically tailored for frontend web apps:

```bash
bunx nylon-mesh init
```
This generates a `nylon-mesh.yaml` in your project folder. No code required.

## Running the Proxy

Start the proxy by pointing it to your config file:

```bash
cargo run --release -- nylon-mesh.yaml
```

Or using the CLI tool:

```bash
bunx nylon-mesh start nylon-mesh.yaml
```

---

> 🎉 You're all set! Traffic hitting port `3000` (default) is now being cached and routed to your frontend framework instance efficiently. Check out the [Configuration](/configuration) to fine-tune your mesh.
