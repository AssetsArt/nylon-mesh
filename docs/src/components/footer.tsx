import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-fd-border/50 bg-fd-background py-12 lg:py-16 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-between gap-12">
        <div className="flex flex-col items-center md:items-start max-w-sm">
          <div className="font-bold text-2xl tracking-tight mb-3 bg-linear-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">Nylon Mesh</div>
          <p className="text-sm text-fd-muted-foreground text-center md:text-left mb-6 leading-relaxed">
            A high-performance edge proxy built on Cloudflare Pingora. Cache everything, scale instantly.
          </p>
          <div className="text-xs text-fd-muted-foreground/60 font-medium">
            © {new Date().getFullYear()} Nylon Mesh.
          </div>
        </div>

        <div className="flex gap-16 sm:gap-24 text-sm text-center md:text-left">
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-fd-foreground">Resources</h3>
            <div className="flex flex-col gap-3">
              <Link href="/docs" className="text-fd-muted-foreground hover:text-emerald-400 transition-colors">Documentation</Link>
              <Link href="/docs/guide/deployment" className="text-fd-muted-foreground hover:text-emerald-400 transition-colors">Deployment</Link>
              <Link href="https://github.com/detoro/nylon-mesh" target="_blank" rel="noopener noreferrer" className="text-fd-muted-foreground hover:text-emerald-400 transition-colors">GitHub</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-fd-foreground">Community</h3>
            <div className="flex flex-col gap-3">
              <a href="https://github.com/detoro/nylon-mesh/issues" target="_blank" rel="noopener noreferrer" className="text-fd-muted-foreground hover:text-emerald-400 transition-colors">Issues</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
