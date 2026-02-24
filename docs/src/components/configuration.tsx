'use client';

import { CopyButton } from '@/components/copy-button';

export function Configuration() {
  const yamlContent = `listen: "0.0.0.0:3000"

upstreams:
  - "127.0.0.1:3001"

# DragonflyDB is highly recommended over Redis for Tier 2
# redis_url: "redis://localhost:6379"

cache:
  t1_cap: 100000
  t1_ttl: 3
  t2_ttl: 30
  status: [200, 404]
  content_types:
    - "text/html"

bypass:
  paths:
    - "/_next/"
    - "/api/"
  ext:
    - ".ico"
    - ".png"`;

  return (
    <div className="text-center max-w-4xl mx-auto px-4 mt-16 mb-0">
      <h2 className="text-4xl font-extrabold mb-4 bg-linear-to-br from-fd-foreground to-emerald-500 bg-clip-text text-transparent tracking-tight">
        Drop-in Configuration
      </h2>
      <p className="text-lg text-fd-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
        Everything is controlled through a single, declarative <code className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono text-sm">yaml</code> file. No complex setups or hidden logic.
      </p>

      <div className="relative text-left">
        {/* Glow behind terminal */}
        <div className="absolute -inset-1 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-20" />

        {/* Terminal Window */}
        <div className="relative rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl overflow-hidden ring-1 ring-white/5">
          {/* Mac window controls */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#161b22]">
            <div className="flex gap-2 w-16">
              <div className="w-3 h-3 rounded-full bg-red-500/80 border border-black/10"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-black/10"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80 border border-black/10"></div>
            </div>
            <div className="text-xs font-mono text-gray-400 font-medium">nylon-mesh.yaml</div>
            <div className="w-16 flex justify-end">
              <CopyButton text={yamlContent} />
            </div>
          </div>

          {/* Code Body */}
          <div className="p-6 md:p-8 overflow-x-auto">
            <pre className="text-sm md:text-base font-mono leading-loose">
              <code>
                <span className="text-pink-400">listen</span><span className="text-gray-300">: </span><span className="text-green-400">"0.0.0.0:3000"</span>
                {`\n\n`}
                <span className="text-pink-400">upstreams</span><span className="text-gray-300">:</span>
                {`\n`}
                {`  - `}<span className="text-green-400">"127.0.0.1:3001"</span>
                {`\n\n`}
                <span className="text-gray-500"># DragonflyDB is highly recommended over Redis for Tier 2</span>
                {`\n`}
                <span className="text-gray-500"># redis_url: "redis://localhost:6379"</span>
                {`\n\n`}
                <span className="text-pink-400">cache</span><span className="text-gray-300">:</span>
                {`\n`}
                {`  `}<span className="text-blue-400">t1_cap</span><span className="text-gray-300">: </span><span className="text-yellow-400">100000</span>
                {`\n`}
                {`  `}<span className="text-blue-400">t1_ttl</span><span className="text-gray-300">: </span><span className="text-yellow-400">3</span>
                {`\n`}
                {`  `}<span className="text-blue-400">t2_ttl</span><span className="text-gray-300">: </span><span className="text-yellow-400">30</span>
                {`\n`}
                {`  `}<span className="text-blue-400">status</span><span className="text-gray-300">: [</span><span className="text-yellow-400">200</span><span className="text-gray-300">, </span><span className="text-yellow-400">404</span><span className="text-gray-300">]</span>
                {`\n`}
                {`  `}<span className="text-blue-400">content_types</span><span className="text-gray-300">:</span>
                {`\n`}
                {`    - `}<span className="text-green-400">"text/html"</span>
                {`\n\n`}
                <span className="text-pink-400">bypass</span><span className="text-gray-300">:</span>
                {`\n`}
                {`  `}<span className="text-blue-400">paths</span><span className="text-gray-300">:</span>
                {`\n`}
                {`    - `}<span className="text-green-400">"/_next/"</span>
                {`\n`}
                {`    - `}<span className="text-green-400">"/api/"</span>
                {`\n`}
                {`  `}<span className="text-blue-400">ext</span><span className="text-gray-300">:</span>
                {`\n`}
                {`    - `}<span className="text-green-400">".ico"</span>
                {`\n`}
                {`    - `}<span className="text-green-400">".png"</span>
                {`\n`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
