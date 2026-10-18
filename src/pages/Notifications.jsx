import React, { useEffect, useState, useMemo } from 'react';
import { Bell, Check, Trash2, CalendarClock, CloudSun, Stethoscope, AlertTriangle, Info } from 'lucide-react';
import base44 from '@/api/apiClient';
import EmptyState from '@/components/EmptyState';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const TYPE_ICON = {
  inspection: { icon: CalendarClock, color: 'text-primary bg-primary/10' },
  weather: { icon: CloudSun, color: 'text-primary bg-primary/10' },
  expert: { icon: Stethoscope, color: 'text-primary bg-primary/10' },
  low_confidence: { icon: AlertTriangle, color: 'text-warning-foreground bg-warning/10' },
  advisory: { icon: Info, color: 'text-muted-foreground bg-muted' }
};

export default function Notifications() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    base44.entities.Notification.list('-created_date', 100).then((n) => { setItems(n || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => filter === 'all' ? items : items.filter((n) => n.type === filter), [items, filter]);
  const unread = items.filter((n) => !n.read).length;

  const markRead = async (n) => {
    if (n.read) return;
    try { await base44.entities.Notification.update(n.id, { read: true }); load(); } catch (e) {}
  };
  const markAllRead = async () => {
    await Promise.all(items.filter((n) => !n.read).map((n) => base44.entities.Notification.update(n.id, { read: true })));
    toast({ title: 'All marked as read' }); load();
  };
  const remove = async (n) => { try { await base44.entities.Notification.delete(n.id); load(); } catch (e) {} };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-muted-foreground">{unread > 0 ? `${unread} unread` : "You're all caught up."}</p>
        </div>
        {unread > 0 && <button onClick={markAllRead} className="text-sm font-semibold text-primary hover:underline">Mark all read</button>}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {['all', 'inspection', 'weather', 'expert', 'low_confidence', 'advisory'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium capitalize transition', filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70')}>{f === 'all' ? 'All' : f.replace('_', ' ')}</button>
        ))}
      </div>

      {loading ? <div className="h-24 animate-pulse rounded-2xl bg-muted" /> : filtered.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up." description="No notifications to show." />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const cfg = TYPE_ICON[n.type] || TYPE_ICON.advisory;
            const Icon = cfg.icon;
            return (
              <div key={n.id} className={cn('flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-soft transition', n.read ? 'border-border opacity-70' : 'border-primary/30')}>
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', cfg.color)}><Icon className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_date).toLocaleString()}</p>
                </div>
                <div className="flex gap-1">
                  {!n.read && <button onClick={() => markRead(n)} className="rounded-lg p-2 text-success hover:bg-success/10" title="Mark read"><Check className="h-4 w-4" /></button>}
                  <button onClick={() => remove(n)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}