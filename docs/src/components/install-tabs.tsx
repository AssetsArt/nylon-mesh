'use client';

import { useState } from 'react';
import { CopyButton } from '@/components/copy-button';

const tabs = [
  { name: 'curl', command: 'curl -fsSL https://mesh.nylon.sh/install | bash' },
  { name: 'bun', command: 'bunx nylon-mesh@latest init' },
  { name: 'pnpm', command: 'pnpx nylon-mesh@latest init' },
  { name: 'npm', command: 'npx nylon-mesh@latest init' },
];

export function InstallTabs() {
  const [activeTab, setActiveTab] = useState(tabs[0].name);
  const activeCommand = tabs.find(t => t.name === activeTab)?.command || '';

  return (
    <div className="flex flex-col w-full sm:w-[480px] rounded-xl border border-fd-border bg-fd-card shadow-sm group hover:border-emerald-500/50 transition-colors overflow-hidden">
      <div className="flex px-2 pt-2 gap-1 border-b border-fd-border/50 bg-fd-muted/30">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border border-b-0 ${activeTab === tab.name
              ? 'bg-fd-background text-emerald-500 border-fd-border -mb-px'
              : 'border-transparent text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted/50'
              }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 py-4 text-sm font-mono text-fd-muted-foreground gap-8 bg-fd-background">
        <span className="select-all">{activeCommand}</span>
        <CopyButton text={activeCommand} />
      </div>
    </div>
  );
}
