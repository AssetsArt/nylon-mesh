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
---

<script setup>
import Benchmark from './components/Benchmark.vue'
</script>

<Benchmark />
