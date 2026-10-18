import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DemoBadge({ className, label = 'DEMO AI RESULT' }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-warning-foreground',
      className
    )}>
      <Info className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}