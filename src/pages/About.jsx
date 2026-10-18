import React from 'react';
import { Leaf, Target, HeartHandshake, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function About() {
  const { t } = useLanguage();
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-grid-leaf">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <span className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">{t('pages.about.title')}</h1>
          <p className="mt-4 text-lg text-muted-foreground text-balance">{t('pages.about.subtitle')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground">
            {t('pages.about.description')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {[
            { icon: Target, title: 'pages.about.mission', desc: 'pages.about.mission.desc' },
            { icon: HeartHandshake, title: 'pages.about.for', desc: 'Smallholder farmers, rural communities, and the agricultural officers who support them.' },
            { icon: ShieldCheck, title: 'pages.about.responsible', desc: 'Every result is a preliminary assessment. We never claim 100% accuracy or a definitive diagnosis.' },
            { icon: Leaf, title: 'pages.about.field', desc: 'Low-end Android friendly, offline-aware, and designed for real farming conditions.' }
          ].map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-b from-card to-muted/20 p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.1)]">
                {/* Top highlight bar on hover */}
                <div className="absolute inset-x-0 top-0 h-1 w-0 bg-gradient-to-r from-primary to-primary/40 transition-all duration-500 group-hover:w-full" />

                {/* Animated background glow */}
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-[40px] transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/15" />

                <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5 text-primary transition-all duration-500 group-hover:scale-110 group-hover:border-primary/20 group-hover:from-primary group-hover:to-primary/90 group-hover:text-primary-foreground group-hover:shadow-xl group-hover:shadow-primary/20">
                  <Icon className="h-6 w-6 transition-transform duration-500" />
                </div>
                <h3 className="relative text-lg font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">{t(b.title)}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{t(b.desc)}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-warning/40 bg-warning/10 p-6 text-sm text-muted-foreground">
          <p className="font-semibold text-warning-foreground">{t('pages.about.important')}</p>
          <p className="mt-1">{t('pages.about.important.desc')}</p>
        </div>
      </section>
    </div>
  );
}