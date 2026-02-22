import Link from 'next/link';
import { FrameworkLogos } from '@/components/framework-logos';
import { ArchitectureDiagram } from '@/components/architecture-diagram';
import { Benchmark } from '@/components/benchmark';
import { Configuration } from '@/components/configuration';
import { CopyButton } from '@/components/copy-button';
import { Zap, Layers, Network, Blocks, ChevronRight } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6 text-emerald-400" />,
    title: 'Drop-in Caching',
    description: 'Automatically intercepts and caches SSR HTML and static assets. Acts as a reverse proxy in front of your app, eliminating the need for complex internal caching logic.',
  },
  {
    icon: <Layers className="w-6 h-6 text-blue-400" />,
    title: '2-Tier Architecture',
    description: 'Tier 1 (in-memory RAM via Moka) responds in microseconds. Tier 2 (Redis/DragonflyDB) handles persistent, distributed cache. Your backend only renders once.',
  },
  {
    icon: <Network className="w-6 h-6 text-purple-400" />,
    title: 'Smart Load Balancing',
    description: "Built on Cloudflare's Pingora engine. Round-robin and random selection with weighted upstreams, health probes, and graceful shutdown.",
  },
  {
    icon: <Blocks className="w-6 h-6 text-pink-400" />,
    title: 'Framework Agnostic',
    description: 'Works out of the box with Next.js, Nuxt, React SSR, Angular Universal, and Vue SSR. No framework-specific plugins required.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-emerald-500/30">
      {/* Hero Background Effects */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-fd-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-16 pb-16 px-4 text-center">
        <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-600 dark:text-emerald-400 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          Nylon Mesh v0.1.0 is out
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 max-w-5xl">
          <span className="text-fd-foreground">Cache Everything.</span>
          <br />
          <span className="bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
            Scale Instantly.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-fd-muted-foreground max-w-2xl mb-12 font-medium">
          A high-performance edge proxy that sits in front of your Next.js, Nuxt, or any SSR app, dropping your backend load to near zero.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
          <Link
            href="/docs"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-white font-semibold transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95 no-underline shadow-[0_0_40px_-5px_#10b981]"
          >
            Get Started
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <div className="flex w-full sm:w-auto items-center justify-between rounded-xl border border-fd-border bg-fd-card px-4 py-4 text-sm font-mono text-fd-muted-foreground shadow-sm group hover:border-emerald-500/50 transition-colors">
            <span className="mr-8 select-all">bunx nylon-mesh init</span>
            <CopyButton text="bunx nylon-mesh init" />
          </div>
        </div>
      </section>

      {/* Benchmark Section */}
      <section className="mx-auto w-full max-w-5xl px-4 py-6 relative z-10">
        <Benchmark />
      </section>

      {/* Features Grid (Bento Box Style) */}
      <section className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Why Nylon Mesh?</h2>
          <p className="text-xl text-fd-muted-foreground">Built for modern web frameworks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-3xl border border-fd-border bg-fd-card p-8 transition-all hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="mb-6 inline-flex rounded-2xl bg-fd-background p-4 shadow-sm ring-1 ring-fd-border group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-2xl font-bold text-fd-foreground">{feature.title}</h3>
                <p className="text-fd-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integration components */}
      <div className="relative z-10 bg-fd-card border-t border-fd-border/50 py-24 mt-12 shadow-[inset_0_40px_80px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_40px_80px_rgba(0,0,0,0.2)]">
        <div className="max-w-6xl mx-auto px-4 space-y-32">
          <FrameworkLogos />
          <ArchitectureDiagram />
        </div>
      </div>

      {/* Configuration Section */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-24 relative z-10">
        <Configuration />
      </section>
    </div>
  );
}
