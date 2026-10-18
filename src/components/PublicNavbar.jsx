import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Leaf,
  Menu,
  X,
  LogIn,
  UserPlus
} from 'lucide-react';

import { cn } from '@/lib/utils';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n';

const LINKS = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.how', to: '/how-it-works' },
  { key: 'nav.features', to: '/features' },
  { key: 'nav.about', to: '/about' },
  { key: 'nav.contact', to: '/contact' }
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useLanguage();

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-nav">

      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* BRAND */}
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="group flex items-center gap-3"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition duration-300 group-hover:rotate-3 group-hover:scale-105">
            <Leaf className="h-5 w-5" />
          </span>

          <span className="font-display text-lg font-black tracking-[-0.04em]">
            Payir{' '}
            <span className="text-gradient">
              Kaavalan
            </span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((item) => {
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'rounded-xl px-3 py-2 text-[12px] font-bold transition duration-200',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-2 lg:flex">

          <LanguageSelector compact />

          <button
            onClick={() => go('/login')}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold text-foreground transition hover:bg-muted"
          >
            <LogIn className="h-4 w-4" />
            {t('nav.login')}
          </button>

          <button
            onClick={() => go('/signup')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            {t('nav.start')}
          </button>

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/70 transition hover:bg-muted lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-border/60 bg-card/95 backdrop-blur-2xl lg:hidden animate-fade-in">

          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">

            {LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
              >
                {t(item.key)}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-4 border-t border-border pt-4">

              <LanguageSelector />

              <div className="flex gap-2">

                <button
                  onClick={() => go('/login')}
                  className="flex-1 rounded-xl border border-border px-3 py-2.5 text-xs font-bold transition hover:bg-muted"
                >
                  {t('nav.login')}
                </button>

                <button
                  onClick={() => go('/signup')}
                  className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
                >
                  {t('nav.start')}
                </button>

              </div>

            </div>

          </nav>

        </div>
      )}

    </header>
  );
}