import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, LogOut, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import base44 from '@/api/apiClient';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ nav, title, accent = 'admin' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (!u) {
        setDenied(true);
      } else if (accent === 'expert' && u.role !== 'expert' && u.role !== 'admin') {
        setDenied(true);
      } else if (accent === 'admin' && u.role !== 'admin') {
        setDenied(true);
      }
    }).catch(() => setDenied(true));
  }, [accent]);

  const logout = async () => { await base44.auth.logout(); navigate('/login'); };

  if (denied) {
    return (
      <div className="app-shell flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-sm rounded-2xl border border-border bg-card p-8 shadow-card">
          <h1 className="text-xl font-bold">Access restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">This area is for administrators and experts. You don't have access.</p>
          <button onClick={() => navigate('/dashboard')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><ArrowLeft className="h-4 w-4" /> Back to dashboard</button>
        </div>
      </div>
    );
  }

  if (!user) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;

  const Sidebar = (
    <div className="flex h-full flex-col">
      <Link to={accent === 'expert' ? '/expert/dashboard' : '/admin/dashboard'} className="flex items-center gap-3 px-5 py-5" onClick={() => setOpen(false)}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono font-bold text-xs shadow-soft">
          PK
        </span>
        <div>
          <p className="text-sm font-bold leading-tight">Payir Kaavalan</p>
          <p className="text-xs text-muted-foreground capitalize font-medium">{accent} Portal</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {nav.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition',
                active
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'text-muted-foreground hover:translate-x-1 hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  active ? 'bg-primary-foreground ring-2 ring-primary-foreground/30' : 'bg-muted-foreground/40 group-hover:bg-primary'
                )} />
                <span>{item.label}</span>
              </div>
              {active && (
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-primary-foreground/20 px-1.5 py-0.5 rounded">
                  Live
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3 space-y-1">
        <Link
          to="/dashboard"
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
        >
          <Leaf className="h-4 w-4" /> Go to Farmer View
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
    </div>
  );

  return (
    <div className="app-shell dashboard-shell min-h-screen bg-background">
      <aside className="app-sidebar fixed inset-y-0 left-0 hidden w-64 border-r border-border/80 bg-card/90 shadow-[8px_0_30px_-24px_hsl(var(--primary))] backdrop-blur-xl lg:block">{Sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="app-sidebar absolute inset-y-0 left-0 w-72 max-w-[80%] border-r border-border bg-card shadow-lift animate-fade-in">
            <button className="absolute right-3 top-4 text-muted-foreground" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            {Sidebar}
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md lg:hidden">
          <button onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <span className="font-semibold capitalize">{title}</span>
          <span className="w-5" />
        </header>
        <main className="app-main min-h-[calc(100vh-3.5rem)] p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}