import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sprout, ScanLine, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { label: 'Home', to: '/dashboard', icon: Home },
  { label: 'Crops', to: '/my-crops', icon: Sprout },
  { label: 'Scan', to: '/scan', icon: ScanLine, center: true },
  { label: 'History', to: '/history', icon: History },
  { label: 'Profile', to: '/profile', icon: User }
];

export default function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-md items-end justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const active = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
          const Icon = item.icon;
          if (item.center) {
            return (
              <Link key={item.to} to={item.to} className="relative -mt-5 flex flex-col items-center">
                <span className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lift transition active:scale-95',
                  active && 'ring-4 ring-primary/20'
                )}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="mt-1 text-[11px] font-semibold text-primary">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              <Icon className={cn('h-5 w-5', active ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-[11px] font-medium', active ? 'text-primary' : 'text-muted-foreground')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}