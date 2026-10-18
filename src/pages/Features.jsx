import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import {
  ScanLine, Eye, BookOpen, Stethoscope, Bell, CalendarClock,
  Languages, Mic, WifiOff, History, ShieldCheck, ArrowRight
} from 'lucide-react';

const FEATURES = [
  { icon: ScanLine, title: 'pages.features.ai.title', desc: 'Upload a leaf photo and get a preliminary disease assessment in seconds.' },
  { icon: Eye, title: 'pages.features.quality.title', desc: 'A pre-check stage flags blurry, dark or unclear images before analysis.' },
  { icon: BookOpen, title: 'pages.features.guidance.title', desc: 'Clear, farmer-friendly guidance and safety instructions for every result.' },
  { icon: Stethoscope, title: 'pages.features.expert.title', desc: 'Request a review from an agricultural expert for uncertain or severe cases.' },
  { icon: History, title: 'pages.features.history.title', desc: 'Every assessment is saved so you can track crop health over time.' },
  { icon: Bell, title: 'pages.features.alerts.title', desc: 'Stay ahead with inspection reminders and weather-based advisories.' },
  { icon: CalendarClock, title: 'pages.features.reminders.title', desc: 'Set reminders so you never miss a crop check.' },
  { icon: Languages, title: 'pages.features.languages.title', desc: 'Use the app in English, Tamil, Hindi, Telugu, Kannada or Malayalam.' },
  { icon: Mic, title: 'pages.features.voice.title', desc: 'Listen to results and guidance aloud with built-in text-to-speech.' },
  { icon: WifiOff, title: 'pages.features.offline.title', desc: 'View saved history and crops, and queue scans when the network is poor.' },
  { icon: ShieldCheck, title: 'pages.features.private.title', desc: 'Your diagnoses and crops are visible only to you and your experts.' },
  { icon: BookOpen, title: 'pages.features.knowledge.title', desc: 'Browse a library of common crop conditions and management advice.' }
];

export default function Features() {
  const { t } = useLanguage();
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-grid-leaf">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('pages.features.title')}</h1>
          <p className="mt-4 text-lg text-muted-foreground text-balance">{t('pages.features.subtitle')}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-b from-card to-muted/20 p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.1)]">
                {/* Top highlight bar on hover */}
                <div className="absolute inset-x-0 top-0 h-1 w-0 bg-gradient-to-r from-primary to-primary/40 transition-all duration-500 group-hover:w-full" />

                {/* Animated background glow */}
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-[40px] transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/15" />

                <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5 text-primary transition-all duration-500 group-hover:scale-110 group-hover:border-primary/20 group-hover:from-primary group-hover:to-primary/90 group-hover:text-primary-foreground group-hover:shadow-xl group-hover:shadow-primary/20">
                  <Icon className="h-6 w-6 transition-transform duration-500" />
                </div>
                <h3 className="relative text-lg font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">{t(f.title)}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-lift transition hover:bg-primary/90 active:scale-95">
            {t('pages.features.start')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}