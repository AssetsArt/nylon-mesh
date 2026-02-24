'use client';

import React from 'react';

interface HistogramProps {
  data: { label: string; count: number }[];
  color?: string;
  title: string;
}

export function Histogram({ data, color = 'bg-emerald-500', title }: HistogramProps) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="w-full my-6 p-6 rounded-xl border border-fd-border bg-fd-card shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-fd-foreground">{title}</h3>
      <div className="flex flex-col gap-2 font-mono text-sm">
        {data.map((row, idx) => {
          const percentage = maxCount > 0 ? (row.count / maxCount) * 100 : 0;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-24 text-right tabular-nums text-fd-muted-foreground whitespace-nowrap">
                {row.label.padStart(10, ' ')}
              </div>
              <div className="flex-1 h-5 flex items-center">
                {row.count > 0 ? (
                  <div
                    className={`h-full rounded-r-sm transition-all duration-500 ${color}`}
                    style={{ width: `${Math.max(percentage, 0.5)}%` }}
                  />
                ) : (
                  <div className="h-full border-l border-dashed border-fd-border" />
                )}
              </div>
              <div className="w-20 text-left tabular-nums text-fd-foreground font-semibold">
                [{row.count.toLocaleString()}]
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
