import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf, LayoutDashboard, Sprout, ScanLine, History, Stethoscope,
  Bell, CalendarClock, BookOpen, User, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import base44 from '@/api/apiClient';
import { cn } from '@/lib/utils';
import LanguageSelector from '@/components/LanguageSelector';
import MobileBottomNav from '@/components/MobileBottomNav';
import OfflineBanner from '@/components/OfflineBanner';

const NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Crops', to: '/my-crops', icon: Sprout },
  { label: 'Scan Crop', to: '/scan', icon: ScanLine },
  { label: 'Diagnosis History', to: '/history', icon: History },
  { label: 'Expert Help', to: '/experts', icon: Stethoscope },
  { label: 'Alerts', to: '/alerts', icon: Bell },
  { label: 'Disease Library', to: '/knowledge', icon: BookOpen },
  { label: 'Profile', to: '/profile', icon: User }
];

export default function FarmerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const logout = async () => {
    await base44.auth.logout();
    navigate('/login');
  };

  const name = user?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const greetingName = name.split(' ')[0];

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <Link to="/dashboard" className="flex items-center gap-3 px-5 py-6" onClick={() => setSidebarOpen(false)}>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
          <Leaf className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight">Payir <span className="text-gradient">Kaavalan</span></span>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV.map((item) => {
          const active = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all',
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
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-primary-foreground/20 px-2 py-0.5 rounded-md">
                  Active
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        {(user?.role === 'expert' || user?.role === 'admin') && (
          <Link
            to={user?.role === 'admin' ? '/admin/dashboard' : '/expert/dashboard'}
            className="mb-2 flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition"
          >
            <span>🩺 {user?.role === 'admin' ? 'Admin Portal' : 'Expert Portal'}</span>
            <span>&rarr;</span>
          </Link>
        )}
        <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {greetingName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user?.role || 'Farmer'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="app-shell farmer-shell min-h-screen bg-background">
      <OfflineBanner />
      {/* Desktop sidebar */}
      <aside className="app-sidebar fixed inset-y-0 left-0 hidden w-64 glass-nav lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="app-sidebar absolute inset-y-0 left-0 w-72 max-w-[80%] glass-nav shadow-lift animate-fade-in">
            <button className="absolute right-3 top-4 text-muted-foreground" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 glass-nav lg:hidden">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-bold">Payir <span className="text-primary">Kaavalan</span></span>
          </Link>
          <LanguageSelector compact />
        </header>

        <main className="app-main min-h-[calc(100vh-3.5rem)] pb-24 lg:pb-8">
          <Outlet context={{ user, greetingName }} />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}