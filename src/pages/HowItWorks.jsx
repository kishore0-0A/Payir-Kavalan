import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Camera, BrainCircuit, Eye, ClipboardCheck, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

const STEPS = [
  { icon: Camera, title: 'pages.how.capture', desc: 'Take a clear photo of the affected leaf or plant, or upload one from your gallery.' },
  { icon: BrainCircuit, title: 'pages.how.analyze', desc: 'The AI reviews visible patterns in the image and estimates its confidence.' },
  { icon: Eye, title: 'pages.how.understand', desc: 'See the possible disease, confidence level and estimated visible severity.' },
  { icon: ClipboardCheck, title: 'pages.how.act', desc: 'Follow guidance or request expert verification for uncertain cases.' }
];

export default function HowItWorks() {
  const { t } = useLanguage();
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-grid-leaf">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('pages.how.title')}</h1>
          <p className="mt-4 text-lg text-muted-foreground text-balance">{t('pages.how.subtitle')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="group relative flex flex-col gap-5 overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-r from-card to-muted/10 p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.1)] sm:flex-row sm:items-center sm:gap-6 sm:p-8">
                
                {/* Large watermark number */}
                <div className="pointer-events-none absolute -right-4 -top-8 text-[8rem] font-black leading-none text-primary/[0.03] transition-all duration-500 group-hover:-translate-x-2 group-hover:scale-110 group-hover:text-primary/[0.07]">
                  {i + 1}
                </div>

                {/* Left glow on hover */}
                <div className="pointer-events-none absolute left-0 top-0 h-full w-48 bg-gradient-to-r from-primary/5 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:border-primary/30 group-hover:from-primary group-hover:to-primary/90 group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20">
                  <Icon className="h-7 w-7 transition-transform duration-500" />
                </div>
                
                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary sm:hidden">
                      {i + 1}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                      {t(s.title)}
                    </h3>
                  </div>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-warning/40 bg-warning/10 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-warning-foreground" />
            <div>
              <h3 className="font-semibold text-warning-foreground">{t('pages.how.warningTitle')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t('pages.how.warning')}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-lift transition hover:bg-primary/90 active:scale-95">
            <ShieldCheck className="h-5 w-5" /> {t('pages.how.start')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}