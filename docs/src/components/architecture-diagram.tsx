'use client';

export function ArchitectureDiagram() {
  return (
    <div className="py-16 px-6 text-center">
      <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-br from-fd-foreground to-emerald-500 bg-clip-text text-transparent tracking-tight">
        How It Works
      </h2>
      <p className="text-lg text-fd-muted-foreground max-w-xl mx-auto mb-14 leading-relaxed">
        Nylon Mesh intercepts every HTTP request, checks its 2-tier cache, and only hits your backend when absolutely necessary.
      </p>

      <div className="flex items-center justify-center flex-wrap md:flex-nowrap gap-0 max-w-full mx-auto px-4">
        {/* Client */}
        <div className="bg-fd-card border border-fd-border rounded-2xl px-6 py-5 min-w-[120px] shrink-0 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="text-3xl mb-2">🌐</div>
          <div className="font-bold text-lg text-fd-foreground mb-0.5">Client</div>
          <div className="text-xs text-fd-muted-foreground font-medium">Browser / CDN</div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1 px-2 shrink-1">
          <div className="flex items-center gap-0">
            <div className="w-10 h-0.5 bg-gradient-to-r from-emerald-500/30 to-emerald-500" />
            <svg viewBox="0 0 12 12" width="10" height="10"><path d="M0 0 L12 6 L0 12 Z" fill="#10b981" /></svg>
          </div>
          <span className="text-[0.65rem] text-fd-muted-foreground font-medium whitespace-nowrap">HTTP Request</span>
        </div>

        {/* Nylon Mesh */}
        <div className="border border-emerald-500/30 bg-gradient-to-br from-fd-card to-emerald-500/5 rounded-2xl px-6 py-5 min-w-[180px] shrink-0 shadow-lg shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/20 hover:border-emerald-500/50">
          <div className="font-bold text-lg text-fd-foreground mb-0.5">Nylon Mesh</div>
          <div className="text-xs text-fd-muted-foreground font-medium">Pingora Core</div>

          <div className="mt-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-3 py-1.5 text-xs">
              <span className="bg-emerald-500 text-white font-bold text-[0.6rem] px-1.5 py-0.5 rounded tracking-wide">T1</span>
              <span className="text-fd-foreground font-semibold">RAM Cache</span>
              <span className="ml-auto text-emerald-500 font-mono font-semibold">~0.01ms</span>
            </div>
            <div className="text-[0.65rem] text-fd-muted-foreground text-center font-medium">↓ miss</div>
            <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-3 py-1.5 text-xs">
              <span className="bg-blue-500 text-white font-bold text-[0.6rem] px-1.5 py-0.5 rounded tracking-wide">T2</span>
              <span className="text-fd-foreground font-semibold">Redis</span>
              <span className="ml-auto text-emerald-500 font-mono font-semibold">~0.5ms</span>
            </div>
          </div>
        </div>

        {/* Arrow (dashed) */}
        <div className="flex flex-col items-center gap-1 px-2 shrink-1">
          <div className="flex items-center gap-0">
            <div className="w-10 h-0.5 bg-[repeating-linear-gradient(90deg,#6e7681_0px,#6e7681_4px,transparent_4px,transparent_8px)]" />
            <svg viewBox="0 0 12 12" width="10" height="10"><path d="M0 0 L12 6 L0 12 Z" fill="#6e7681" /></svg>
          </div>
          <span className="text-[0.65rem] text-fd-muted-foreground font-medium whitespace-nowrap">Only on cache miss</span>
        </div>

        {/* Backend */}
        <div className="bg-fd-card border border-fd-border rounded-2xl px-6 py-5 min-w-[120px] shrink-0 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="text-3xl mb-2">🖥️</div>
          <div className="font-bold text-lg text-fd-foreground mb-0.5">Backend</div>
          <div className="text-xs text-fd-muted-foreground font-medium">Next.js / Nuxt / etc.</div>
        </div>
      </div>
    </div>
  );
}
