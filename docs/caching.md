# SSR & Frontend Caching

Nylon Mesh is purpose-built to absorb repetitive traffic spikes that would normally overwhelm Server-Side Rendered (SSR) Node.js applications like Next.js or Nuxt. It acts as an unbreakable Stale Shield using a **Tiered Caching** architecture.

## Cache Tiers

### Tier 1 Cache (Local Memory)
The first layer of defense. It caches the rendered HTML payloads and static files directly in the proxy server's RAM (moka implementation):
- **`tier1_capacity`**: The maximum number of elements (pages/files) to hold concurrently (e.g., `10000`).
- **`tier1_ttl_seconds`**: Time-to-Live. The proxy will serve from RAM and *will not* touch your Next/Nuxt server during this interval. Set to a low value (e.g., `3` to `5` seconds) for high-traffic environments to prevent backend melting while keeping data near real-time.

### Tier 2 Cache (Redis)
A distributed, persistent cache layer backing up Tier 1:
- **`redis_url`**: Your `redis://localhost:6379` connection string.
- **`tier2_ttl_seconds`**: General Time-to-Live (e.g., `60` seconds or more) for pages that don't need real-time updates.

**How the Stale Shield works:**
When 1,000 users request the homepage simultaneously:
1. Proxy searches **Tier 1 (RAM)** first -> First request MISSES.
2. Proxy searches **Tier 2 (Redis)** -> First request MISSES.
3. Proxy hits your **Next.js/Nuxt** server ONCE.
4. The remaining 999 requests are served instantly from the **Tier 1 RAM** cache, never reaching Node.js!

---

## Cache Bypass for Dynamic Routes

In frontend frameworks, you have static pages (home, blogs) and highly dynamic systems (APIs, user dashboards, admin panels). You must prevent Nylon from caching dynamic paths:

```yaml
bypass:
  paths:
    - "/_next/webpack-hmr" # Next.js dev server hot-reloading
    - "/api/"              # Never cache backend API calls
    - "/admin/"            # Never cache authenticated panels
  extensions:
    - ".ico"               # Skip caching favicons in proxy memory
```
> [!IMPORTANT]
> Bypass rules have absolute priority. If a user hits `/api/users`, the proxy ignores all caching logic and forwards the request directly to the backend.

---

## Cache-Control Header Injection

Modern frameworks bundle CSS, JS, and image assets with unique hashes (e.g., `_next/static/css/hash.css`). These files never change and should be cached permanently by the user's browser, reducing your server's bandwidth footprint.

Administrators can use Nylon Mesh to dynamically inject `Cache-Control` headers into the response, forcing the browser or external CDNs to cache them:

```yaml
cache_control:
  - value: "public, max-age=31536000, immutable"
    paths:
      - "/_next/static/"  # Next.js static assets
      - "/_nuxt/"         # Nuxt.js static assets
    extensions:
      - ".png"
      - ".jpg"
      - ".svg"
```
By defining this, your downstream proxy instructs the browser: *"Keep these static framework files for a year, do not ask the server for them again."*
