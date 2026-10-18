import React from 'react';
import { cn } from '@/lib/utils';

const CONFIG = {
  mild: { label: 'Mild', color: 'bg-success/15 text-success border-success/30', desc: 'Limited visible symptoms' },
  moderate: { label: 'Moderate', color: 'bg-warning/15 text-warning-foreground border-warning/40', desc: 'Symptoms appear noticeable and may require attention' },
  severe: { label: 'Severe', color: 'bg-destructive/15 text-destructive border-destructive/30', desc: 'Visible symptoms appear extensive. Expert verification is recommended.' }
};

export default function SeverityBadge({ severity = 'mild', showDesc = false, className }) {
  const cfg = CONFIG[severity] || CONFIG.mild;
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className={cn('inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold', cfg.color)}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {cfg.label}
      </span>
      {showDesc && <span className="text-sm text-muted-foreground">{cfg.desc}</span>}
    </div>
  );
}