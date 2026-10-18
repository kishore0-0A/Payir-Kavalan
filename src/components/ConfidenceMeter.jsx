import React from 'react';
import { cn } from '@/lib/utils';

export default function ConfidenceMeter({ confidence = 0, label }) {
  const pct = Math.round(confidence * 100);
  let tier = 'low';
  let tierLabel = 'Low confidence';
  let color = 'hsl(var(--destructive))';
  if (confidence >= 0.8) { tier = 'high'; tierLabel = 'High confidence'; color = 'hsl(var(--success))'; }
  else if (confidence >= 0.6) { tier = 'moderate'; tierLabel = 'Moderate confidence'; color = 'hsl(var(--warning))'; }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label || 'How confident is the AI?'}</span>
        <span className="text-2xl font-bold text-foreground tabular-nums">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn('inline-block h-2 w-2 rounded-full')}
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-foreground">{tierLabel}</span>
      </div>
    </div>
  );
}