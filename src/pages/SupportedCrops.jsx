import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ScanLine, Info } from 'lucide-react';
import { SUPPORTED_CROPS } from '@/lib/cropData';
import { useLanguage } from '@/lib/i18n';

export default function SupportedCrops() {
  const { t } = useLanguage();
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-grid-leaf">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Sprout className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{t('pages.crops.title')}</h1>
          <p className="mt-4 text-lg text-muted-foreground text-balance">{t('pages.crops.subtitle')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>{t('pages.crops.info')}</p>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {SUPPORTED_CROPS.map((c) => (
            <div key={c.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:shadow-card">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('pages.crops.conditions')}</p>
                <ul className="mt-1.5 space-y-0.5 text-sm text-muted-foreground">
                  {c.diseases.map((d) => <li key={d}>• {d}</li>)}
                </ul>
                <Link to="/signup" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20">
                  <ScanLine className="h-4 w-4" /> {t('pages.crops.inspect')}
                </Link>
              </div>
            </div>
          ))}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
            <Sprout className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-semibold text-foreground">{t('pages.crops.more')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('pages.crops.expanding')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}