import Link from 'next/link';
import { FrameworkLogos } from '@/components/framework-logos';
import { ArchitectureDiagram } from '@/components/architecture-diagram';
import { Benchmark } from '@/components/benchmark';

const features = [
  {
    icon: '⚡',
    title: 'Zero-Config Caching',
    description: 'Automatically intercepts and caches SSR HTML and static assets. No custom caching logic needed inside your app—just point traffic through the mesh.',
  },
  {
    icon: '🧱',
    title: '2-Tier Architecture',
    description: 'Tier 1 (in-memory RAM via Moka) responds in microseconds. Tier 2 (Redis) handles persistent, distributed cache. Your backend only renders once.',
  },
  {
    icon: '⚖️',
    title: 'Smart Load Balancing',
    description: "Built on Cloudflare's Pingora engine. Round-robin and random selection with weighted upstreams, health probes, and graceful shutdown.",
  },
  {
    icon: '🛡️',
    title: 'Framework Agnostic',
    description: 'Works out of the box with Next.js, Nuxt, React SSR, Angular Universal, and Vue SSR. No framework-specific plugins required.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 relative">
          <span className="bg-gradient-to-br from-fd-foreground via-fd-foreground to-emerald-500 bg-clip-text text-transparent">
            Nylon Mesh
          </span>
        </h1>
        <p className="text-2xl md:text-3xl font-bold text-fd-foreground/80 mb-4">
          Cache Everything. Scale Instantly.
        </p>
        <p className="text-lg text-fd-muted-foreground max-w-2xl mb-10 leading-relaxed">
          A zero-config edge proxy that sits in front of your Next.js, Nuxt, or any SSR app.
          2-tier caching (RAM + Redis) drops your backend load to near zero.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/docs"
            className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold text-lg transition-all duration-200 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 no-underline"
          >
            Get Started →
          </Link>
          <Link
            href="/docs/configuration"
            className="px-8 py-3 rounded-xl bg-fd-secondary text-fd-foreground font-bold text-lg transition-all duration-200 hover:bg-fd-accent hover:-translate-y-0.5 no-underline"
          >
            View Configuration
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-fd-card border border-fd-border rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-fd-foreground mb-3">{feature.title}</h3>
              <p className="text-fd-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <FrameworkLogos />
      <ArchitectureDiagram />
      <Benchmark />
    </div>
  );
}
