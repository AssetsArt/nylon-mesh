---
layout: home

hero:
  name: "Nylon Mesh"
  text: "The Ultimate SSR & Frontend Caching Proxy"
  tagline: "Designed specifically for Next.js, Nuxt, React, Angular, and Vue. Stop worrying about complex cache setups and let Nylon handle the heavy lifting."
  actions:
    - theme: brand
      text: Get Started ->
      link: /getting-started
    - theme: alt
      text: View Configuration
      link: /configuration

features:
  - title: ⚡ Zero-Config SSR Caching
    details: Automatically caches Server-Side Rendered (SSR) HTML and static assets. Dramatically reduces the load on your Node.js backend.
  - title: 🛠️ Framework Agnostic
    details: Works seamlessly out of the box with Next.js, Nuxt, Angular, Vue, and React without needing complex framework-specific caching logic.
  - title: 🚀 2-Tier Caching Architecture
    details: Supercharge your delivery with an ultra-fast Local Memory (RAM) tier and a persistent Redis tier for massive scale traffic spikes.
  - title: ⚖️ Cloudflare Pingora Core
    details: Built in Rust on top of Cloudflare's Pingora. Inherently memory-safe, lightweight, and supports powerful load balancing out of the box.
---

<br>

<div align="center">
  <h2>Blazing Fast Performance</h2>
  <p>Benchmarked with <code>oha</code> (120 concurrent connections) on an M1 Pro (10-core, 16GB RAM):</p>
  <pre style="text-align: left; background: #1e1e1e; padding: 1.5rem; border-radius: 8px; width: fit-content; margin: 0 auto; overflow-x: auto;">
Summary:
  Success rate:	100.00%
  Total:	10.00 secs
  Requests/sec:	<b>99130.79</b>
  Average latency: 1.20 ms
  Status code:	[200] 991,484 responses
  </pre>
</div>
