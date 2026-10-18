import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnline } from '@/lib/useOnline';

export default function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm font-medium text-warning-foreground animate-fade-in">
      <WifiOff className="h-4 w-4" />
      Offline Mode — saved diagnoses and crops are still available. New scans will be queued.
    </div>
  );
}