import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Leaf,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

import PublicNavbar from '@/components/PublicNavbar';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n';

export default function PublicLayout() {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <div className="app-shell public-shell flex min-h-screen flex-col bg-background">

      <PublicNavbar />

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      <footer className="border-t border-border/70 bg-card">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="grid gap-10 md:grid-cols-[1.6fr_0.8fr_1fr]">

            {/* BRAND */}
            <div>

              <Link
                to="/"
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/15">
                  <Leaf className="h-5 w-5" />
                </span>

                <span className="font-display text-lg font-black">
                  Payir{' '}
                  <span className="text-gradient">
                    Kaavalan
                  </span>
                </span>
              </Link>

              <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
                {t('footer.description')}
              </p>

              <div className="mt-5">
                <LanguageSelector />
              </div>

            </div>

            {/* PLATFORM */}
            <div>

              <h4 className="text-xs font-black uppercase tracking-[0.16em] text-foreground">
                {t('footer.platform')}
              </h4>

              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">

                <li>
                  <Link
                    to="/how-it-works"
                    className="transition hover:text-primary"
                  >
                    {t('nav.how')}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/features"
                    className="transition hover:text-primary"
                  >
                    {t('nav.features')}
                  </Link>
                </li>



                <li>
                  <Link
                    to="/about"
                    className="transition hover:text-primary"
                  >
                    {t('nav.about')}
                  </Link>
                </li>

              </ul>

            </div>

            {/* CONTACT */}
            <div>

              <h4 className="text-xs font-black uppercase tracking-[0.16em] text-foreground">
                {t('footer.contact')}
              </h4>

              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">

                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  hello@payirkaavalan.in
                </li>

                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  +91 80000 00000
                </li>

                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  {t('footer.location')}
                </li>

              </ul>

            </div>

          </div>

          {/* BOTTOM */}
          <div className="mt-12 border-t border-border pt-6">

            <p className="max-w-4xl text-[11px] leading-6 text-muted-foreground">
              {t('footer.disclaimer')}
            </p>

            <p className="mt-3 text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} Payir Kaavalan.{' '}
              {t('footer.rights')}
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}