---
layout: home

hero:
  name: "Nylon Mesh"
  text: "Cache Everything. Scale Instantly."
  tagline: "A zero-config edge proxy that sits in front of your Next.js, Nuxt, or any SSR app. 2-tier caching (RAM + Redis) drops your backend load to near zero."
  actions:
    - theme: brand
      text: Get Started →
      link: /getting-started
    - theme: alt
      text: View Configuration
      link: /configuration

features:
  - title: ⚡ Zero-Config Caching
    details: Automatically intercepts and caches SSR HTML and static assets. No custom caching logic needed inside your app—just point traffic through the mesh.
  - title: 🧱 2-Tier Architecture
    details: Tier 1 (in-memory RAM via Moka) responds in microseconds. Tier 2 (Redis) handles persistent, distributed cache. Your backend only renders once.
  - title: ⚖️ Smart Load Balancing
    details: Built on Cloudflare's Pingora engine. Round-robin and random selection with weighted upstreams, health probes, and graceful shutdown.
  - title: 🛡️ Framework Agnostic
    details: Works out of the box with Next.js, Nuxt, React SSR, Angular Universal, and Vue SSR. No framework-specific plugins required.
---

<script setup>
import Benchmark from './components/Benchmark.vue'
import ArchitectureDiagram from './components/ArchitectureDiagram.vue'
import FrameworkLogos from './components/FrameworkLogos.vue'
</script>

<FrameworkLogos />
<ArchitectureDiagram />
<Benchmark />
