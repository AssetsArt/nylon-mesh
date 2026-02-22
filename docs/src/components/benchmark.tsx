'use client';

import { useEffect, useRef, useState } from 'react';

export function Benchmark() {
  const [vanillaReqSec, setVanillaReqSec] = useState(0);
  const [vanillaLatency, setVanillaLatency] = useState('0.00');
  const [vanillaTransfer, setVanillaTransfer] = useState(0);
  const [meshReqSec, setMeshReqSec] = useState(0);
  const [meshLatency, setMeshLatency] = useState('0.00');
  const [meshTransfer, setMeshTransfer] = useState(0);
  const [multiplier, setMultiplier] = useState('0.0');
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    const vTargetReq = 5181, vTargetLat = 23.20, vTargetTrans = 15;
    const mTargetReq = 100321, mTargetLat = 1.19, mTargetTrans = 292;
    const targetMultiplier = mTargetReq / vTargetReq;
    const duration = 2000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - Math.max(startTime, 0);

      if (elapsed < duration) {
        const p = 1 - Math.pow(1 - elapsed / duration, 4);
        setVanillaReqSec(Math.floor(p * vTargetReq));
        setVanillaLatency((p * vTargetLat).toFixed(2));
        setVanillaTransfer(Math.floor(p * vTargetTrans));
        setMeshReqSec(Math.floor(p * mTargetReq));
        setMeshLatency((p * mTargetLat).toFixed(2));
        setMeshTransfer(Math.floor(p * mTargetTrans));
        setMultiplier((p * targetMultiplier).toFixed(1));
      } else {
        const t = timestamp / 1000;
        const vr = Math.floor(vTargetReq + Math.sin(t * 2) * 150 + Math.cos(t * 3.5) * 80);
        setVanillaReqSec(vr);
        setVanillaLatency(Math.max(10, vTargetLat + Math.sin(t * 3) * 0.8 + Math.cos(t * 1.8) * 0.5).toFixed(2));
        setVanillaTransfer(Math.floor(vTargetTrans + Math.sin(t * 2.5) * 1 + Math.cos(t * 4) * 0.5));
        const mr = Math.floor(mTargetReq + Math.sin(t * 2) * 800 + Math.cos(t * 3.5) * 500);
        setMeshReqSec(mr);
        setMeshLatency(Math.max(0.8, mTargetLat + Math.sin(t * 3) * 0.08 + Math.cos(t * 1.8) * 0.05).toFixed(2));
        setMeshTransfer(Math.floor(mTargetTrans + Math.sin(t * 2.5) * 6 + Math.cos(t * 4) * 4));
        setMultiplier((mr / Math.max(vr, 1)).toFixed(1));
      }
      animationId.current = requestAnimationFrame(animate);
    };

    animationId.current = requestAnimationFrame(animate);
    return () => { if (animationId.current) cancelAnimationFrame(animationId.current); };
  }, []);

  return (
    <div className="relative text-center py-8 px-6 pb-16 overflow-hidden">
      <h2 className="text-4xl font-extrabold mb-4 bg-linear-to-br from-fd-foreground to-emerald-500 bg-clip-text text-transparent tracking-tight animate-[slideUp_0.6s_ease-out]">
        Blazing Fast on Edge
      </h2>
      <p className="text-lg text-fd-muted-foreground mb-10 leading-relaxed animate-[slideUp_0.6s_ease-out_0.1s_both]">
        Tested with <code className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-semibold text-sm">oha</code> — 120 concurrent connections on <strong>Apple M1 Pro</strong> serving a default <code className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-semibold text-sm">Next.js 16</code> app.
      </p>

      {/* Multiplier */}
      <div className="flex items-baseline justify-center gap-1.5 mb-10 animate-[slideUp_0.6s_ease-out_0.2s_both]">
        <span className="text-7xl font-black bg-linear-to-br from-emerald-500 via-green-500 to-cyan-400 bg-clip-text text-transparent leading-none tracking-tighter drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          {multiplier}×
        </span>
        <span className="text-xl font-semibold text-fd-muted-foreground">faster</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8 mb-12 relative animate-[slideUp_0.6s_ease-out_0.3s_both] w-full max-w-5xl mx-auto">
        {/* Mesh Card */}
        <div className="flex-1 w-full rounded-2xl p-8 relative overflow-hidden bg-linear-to-br from-fd-card to-emerald-500/5 border border-emerald-500/25 shadow-lg shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-fd-foreground m-0">With Nylon Mesh</h3>
            <span className="text-xs font-bold tracking-wide px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">⚡ Cached</span>
          </div>
          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            <div className="flex flex-col items-start col-span-2">
              <span className="text-5xl font-bold bg-linear-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(16,185,129,0.3)] tabular-nums">{meshReqSec.toLocaleString()}</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-fd-muted-foreground mt-2">Requests / Second</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-emerald-500 tabular-nums">{meshLatency}<small className="text-sm font-semibold text-emerald-500/50 ml-0.5">ms</small></span>
              <span className="text-xs uppercase tracking-wider font-semibold text-fd-muted-foreground mt-1.5">Avg Latency</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-emerald-500 tabular-nums">{meshTransfer}<small className="text-sm font-semibold text-emerald-500/50 ml-0.5">MB/s</small></span>
              <span className="text-xs uppercase tracking-wider font-semibold text-fd-muted-foreground mt-1.5">Throughput</span>
            </div>
          </div>
        </div>

        {/* VS Badge (Desktop) */}
        <div className="hidden lg:flex absolute left-1/2 top-[calc(50%+1rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center z-2">
          <div className="w-12 h-12 rounded-full bg-fd-card border border-fd-border flex items-center justify-center font-extrabold italic text-fd-muted-foreground text-sm shadow-xl">VS</div>
        </div>

        {/* VS Badge (Mobile) */}
        <div className="flex lg:hidden items-center justify-center my-2 z-2">
          <div className="w-10 h-10 rounded-full bg-fd-card border border-fd-border flex items-center justify-center font-extrabold italic text-fd-muted-foreground text-sm shadow-lg">VS</div>
        </div>

        {/* Vanilla Card */}
        <div className="flex-1 w-full rounded-2xl p-8 bg-fd-card/60 border border-fd-border opacity-85 transition-all duration-300 hover:-translate-y-1 hover:opacity-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-fd-foreground m-0">Next.js</h3>
            <span className="text-xs font-bold tracking-wide px-2.5 py-1 rounded-full bg-fd-muted-foreground/10 text-fd-muted-foreground border border-fd-muted-foreground/20">No Cache</span>
          </div>
          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            <div className="flex flex-col items-start col-span-2">
              <span className="text-5xl font-bold text-fd-muted-foreground tabular-nums">{vanillaReqSec.toLocaleString()}</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-fd-muted-foreground mt-2">Requests / Second</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-fd-muted-foreground tabular-nums">{vanillaLatency}<small className="text-sm font-semibold text-fd-muted-foreground/70 ml-0.5">ms</small></span>
              <span className="text-xs uppercase tracking-wider font-semibold text-fd-muted-foreground mt-1.5">Avg Latency</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-fd-muted-foreground tabular-nums">{vanillaTransfer}<small className="text-sm font-semibold text-fd-muted-foreground/70 ml-0.5">MB/s</small></span>
              <span className="text-xs uppercase tracking-wider font-semibold text-fd-muted-foreground mt-1.5">Throughput</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
