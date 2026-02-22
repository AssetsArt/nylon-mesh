'use client';

import { Globe, Server } from 'lucide-react';

export function ArchitectureDiagram() {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-extrabold mb-4 bg-linear-to-br from-fd-foreground to-emerald-500 bg-clip-text text-transparent tracking-tight">
        How It Works
      </h2>
      <p className="text-lg text-fd-muted-foreground max-w-xl mx-auto mb-14 leading-relaxed">
        Nylon Mesh intercepts every HTTP request, checks its 2-tier cache, and only hits your backend when absolutely necessary.
      </p>

      <div className="flex items-center justify-center flex-col md:flex-row flex-wrap md:flex-nowrap gap-2 md:gap-0 max-w-full mx-auto px-4">
        {/* Client */}
        <div className="flex flex-col items-center justify-center bg-fd-card/50 border border-fd-border rounded-2xl px-6 py-6 min-w-[140px] shrink-0 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30 group">
          <div className="p-3 bg-blue-500/10 rounded-xl mb-3 group-hover:bg-blue-500/20 transition-colors">
            <Globe className="w-8 h-8 text-blue-400" />
          </div>
          <div className="font-bold text-lg text-fd-foreground mb-0.5">Client</div>
          <div className="text-xs text-fd-muted-foreground font-medium">Browser / CDN</div>
        </div>

        {/* Arrow 1 */}
        <div className="hidden md:flex flex-col items-center gap-1.5 px-3 shrink-1">
          <div className="flex items-center gap-0 w-full justify-center">
            <div className="w-12 h-0.5 bg-linear-to-r from-emerald-500/30 to-emerald-500" />
            <svg viewBox="0 0 12 12" width="12" height="12"><path d="M0 0 L12 6 L0 12 Z" fill="#10b981" /></svg>
          </div>
          <span className="text-[0.65rem] text-emerald-500/80 font-bold uppercase tracking-wider whitespace-nowrap">Request</span>
        </div>

        {/* Mobile Arrow 1 */}
        <div className="md:hidden flex items-center justify-center my-2">
          <svg viewBox="0 0 12 12" width="12" height="12" className="rotate-90"><path d="M0 0 L12 6 L0 12 Z" fill="#10b981" /></svg>
        </div>

        {/* Nylon Mesh */}
        <div className="flex flex-col items-center border border-emerald-500/30 bg-linear-to-br from-emerald-500/5 to-transparent rounded-3xl px-8 py-6 min-w-[240px] shrink-0 shadow-xl shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/20 hover:border-emerald-500/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="font-black text-xl text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-500 mb-0.5">Nylon Mesh</div>
            <div className="text-xs text-fd-muted-foreground font-semibold uppercase tracking-wider mb-5">Pingora Core</div>

            <div className="w-full flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-fd-card/80 border border-fd-border rounded-xl px-4 py-2.5 text-sm transition-colors group-hover:border-emerald-500/30 shadow-sm min-w-44">
                <span className="bg-emerald-500/20 text-emerald-400 font-black text-[0.65rem] px-1.5 py-0.5 rounded tracking-wide">T1</span>
                <span className="text-fd-foreground font-bold">RAM Cache</span>
                <span className="ml-auto text-emerald-500 font-mono font-bold">~0.01ms</span>
              </div>
              <div className="text-[0.65rem] text-fd-muted-foreground text-center font-bold tracking-widest uppercase py-0.5">↓ miss</div>
              <div className="flex items-center gap-3 bg-fd-card/80 border border-fd-border rounded-xl px-4 py-2.5 text-sm transition-colors group-hover:border-blue-500/30 shadow-sm min-w-44 whitespace-nowrap">
                <span className="bg-blue-500/20 text-blue-400 font-black text-[0.65rem] px-1.5 py-0.5 rounded tracking-wide">T2</span>
                <span className="text-fd-foreground font-bold text-xs">Redis/Dragonfly</span>
                <span className="ml-auto pl-2 text-blue-400 font-mono font-bold">~0.5ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="hidden md:flex flex-col items-center gap-1.5 px-3 shrink-1">
          <div className="flex items-center gap-0 opacity-60 group-hover:opacity-100 transition-opacity w-full justify-center">
            <div className="w-12 h-0.5 bg-[repeating-linear-gradient(90deg,#6e7681_0px,#6e7681_4px,transparent_4px,transparent_8px)]" />
            <svg viewBox="0 0 12 12" width="12" height="12"><path d="M0 0 L12 6 L0 12 Z" fill="#6e7681" /></svg>
          </div>
          <span className="text-[0.65rem] text-fd-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap">Cache Miss</span>
        </div>

        {/* Mobile Arrow 2 */}
        <div className="md:hidden flex items-center justify-center my-2 opacity-60">
          <svg viewBox="0 0 12 12" width="12" height="12" className="rotate-90"><path d="M0 0 L12 6 L0 12 Z" fill="#6e7681" /></svg>
        </div>

        {/* Backend */}
        <div className="flex flex-col items-center justify-center bg-fd-card/50 border border-fd-border rounded-2xl px-6 py-6 min-w-[140px] shrink-0 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-purple-500/30 group">
          <div className="p-3 bg-purple-500/10 rounded-xl mb-3 group-hover:bg-purple-500/20 transition-colors">
            <Server className="w-8 h-8 text-purple-400" />
          </div>
          <div className="font-bold text-lg text-fd-foreground mb-0.5">Backend</div>
          <div className="text-xs text-fd-muted-foreground font-medium">Next.js / Nuxt</div>
        </div>
      </div>
    </div>
  );
}
