import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowDownRight,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Eye,
  Leaf,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  Upload,
  Zap
} from 'lucide-react';

import { SUPPORTED_CROPS } from '@/lib/cropData';
import { useLanguage } from '@/lib/i18n';

const TRUST = [
  {
    icon: ScanLine,
    key: 'landing.trust.analysis',
  },
  {
    icon: Eye,
    key: 'landing.trust.early',
  },
  {
    icon: BrainCircuit,
    key: 'landing.trust.guidance',
  },
  {
    icon: Stethoscope,
    key: 'landing.trust.expert',
  },
  {
    icon: ShieldCheck,
    key: 'landing.trust.farmer',
  },
];

const STEPS = [
  {
    icon: Camera,
    number: '01',
    key: 'capture',
  },
  {
    icon: BrainCircuit,
    number: '02',
    key: 'analyze',
  },
  {
    icon: Eye,
    number: '03',
    key: 'understand',
  },
  {
    icon: ClipboardCheck,
    number: '04',
    key: 'act',
  },
];

/** @type {Record<string, Record<string, string>>} */
const CROP_NAMES = {
  tomato: {
    en: 'Tomato',
    ta: 'தக்காளி',
    hi: 'टमाटर',
    te: 'టమాటా',
    kn: 'ಟೊಮ್ಯಾಟೊ',
    ml: 'തക്കാളി',
  },

  rice: {
    en: 'Rice',
    ta: 'நெல்',
    hi: 'चावल',
    te: 'వరి',
    kn: 'ಅಕ್ಕಿ',
    ml: 'അരി',
  },

  potato: {
    en: 'Potato',
    ta: 'உருளைக்கிழங்கு',
    hi: 'आलू',
    te: 'బంగాళాదుంప',
    kn: 'ಆಲೂಗಡ್ಡೆ',
    ml: 'ഉരുളക്കിഴങ്ങ്',
  },

  maize: {
    en: 'Maize',
    ta: 'மக்காச்சோளம்',
    hi: 'मक्का',
    te: 'మొక్కజొన్న',
    kn: 'ಮೆಕ್ಕೆಜೋಳ',
    ml: 'ചോളം',
  },

  cotton: {
    en: 'Cotton',
    ta: 'பருத்தி',
    hi: 'कपास',
    te: 'పత్తి',
    kn: 'ಹತ್ತಿ',
    ml: 'പരുത്തി',
  },
};

/**
 * @typedef {'en' | 'ta' | 'hi' | 'te' | 'kn' | 'ml'} LanguageCode
 * @typedef {{ id: string, name: string }} LandingCrop
 */

/**
 * @param {LandingCrop} crop
 * @param {string} lang
 */
function getCropName(crop, lang) {
  return CROP_NAMES[crop.id]?.[lang] || crop.name;
}

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.14 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

export default function Landing() {
  const { lang, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const heroVisualRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const motionProps = shouldReduceMotion
    ? {
        initial: { opacity: 1, y: 0 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : sectionMotion;

  useEffect(() => {
    const element = heroVisualRef.current;

    if (!element) return;

    /** @param {MouseEvent} event */
    const handleMouseMove = (event) => {
      const rect = element.getBoundingClientRect();

      const x =
        ((event.clientX - rect.left) / rect.width - 0.5) * 2;

      const y =
        ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      element.style.setProperty('--mouse-x', `${x * 7}px`);
      element.style.setProperty('--mouse-y', `${y * 7}px`);
    };

    const handleMouseLeave = () => {
      element.style.setProperty('--mouse-x', '0px');
      element.style.setProperty('--mouse-y', '0px');
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="landing-page min-h-screen overflow-hidden bg-background text-foreground">

      {/* =====================================================
          HERO
      ====================================================== */}

      <motion.section
        {...motionProps}
        initial={{ opacity: 1, y: 0 }}
        className="relative isolate overflow-hidden border-b border-border/60"
      >

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,hsl(var(--primary)/0.12),transparent_27%),radial-gradient(circle_at_90%_20%,rgba(20,184,166,0.10),transparent_25%)]" />

        <div className="absolute inset-0 bg-grid-leaf opacity-40" />

        <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-primary/10 blur-[110px]" />

        <div className="pointer-events-none absolute -right-40 bottom-10 h-[32rem] w-[32rem] rounded-full bg-emerald-300/10 blur-[120px]" />

        <div className="relative mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-[1400px] items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-10 xl:px-14">

          {/* LEFT CONTENT */}

          <div className="relative z-10 max-w-[650px]">

            <h1 className="mt-2 max-w-[720px] font-display text-[clamp(2.75rem,5.5vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] bg-transparent">
              <span className="block text-foreground">
                {t('landing.hero.line1')}
              </span>
              <span className="mt-1 block text-gradient">
                {t('landing.hero.line2')}
              </span>
            </h1>

            <p className="hero-enter mt-6 max-w-[590px] text-[15px] leading-7 text-muted-foreground sm:text-[16px] sm:leading-8">
              {t('landing.hero.description')}
            </p>

            {/* CTA BUTTONS */}

            <div className="hero-enter mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                to="/signup"
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-[0_18px_45px_hsl(var(--primary)/0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_hsl(var(--primary)/0.28)]"
              >
                <ScanLine className="h-[18px] w-[18px]" />

                {t('landing.hero.primary')}

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/how-it-works"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-border bg-card/80 px-6 text-sm font-extrabold text-foreground shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-card"
              >
                {t('landing.hero.secondary')}

                <ChevronRight className="h-4 w-4" />
              </Link>

            </div>

            {/* SMALL TRUST ITEMS */}

            <div className="hero-enter mt-7 flex max-w-[620px] flex-wrap gap-x-5 gap-y-2.5">

              {[
                t('landing.hero.note1'),
                t('landing.hero.note2'),
                t('landing.hero.note3'),
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground sm:text-xs"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}

            </div>

          </div>

          {/* HERO VISUAL */}

          <div
            ref={heroVisualRef}
            className="hero-visual-wrap relative mx-auto w-full max-w-[590px]"
          >

            <div
              className="hero-visual relative"
              style={{
                transform:
                  'translate3d(var(--mouse-x, 0px), var(--mouse-y, 0px), 0)',
              }}
            >

              <div className="absolute -inset-10 rounded-[4rem] bg-primary/10 blur-3xl" />

              <div className="relative aspect-[0.9] overflow-hidden rounded-[2.75rem] border border-white/50 bg-slate-950 shadow-[0_35px_100px_rgba(15,23,42,0.22)]">

                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=90"
                  alt={t('landing.hero.imageAlt')}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(3,20,13,0.04),rgba(3,20,13,0.22)_45%,rgba(1,7,5,0.92))]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(110,255,175,0.18),transparent_30%)]" />

                {/* TOP BAR */}

                <div className="absolute left-5 right-5 top-5 rounded-2xl border border-white/15 bg-black/25 p-3 backdrop-blur-xl sm:left-6 sm:right-6 sm:top-6">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Leaf className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-extrabold text-white">
                          Payir Kaavalan
                        </p>

                        <p className="mt-0.5 text-[9px] font-medium text-white/50">
                          {t('landing.visual.liveAnalysis')}
                        </p>
                      </div>

                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      {t('landing.visual.active')}
                    </div>

                  </div>

                </div>

                {/* SCAN FRAME */}

                <div className="absolute left-[12%] right-[12%] top-[21%] bottom-[28%] rounded-[2rem] border border-emerald-300/80">

                  <span className="absolute -left-px -top-px h-10 w-10 rounded-tl-2xl border-l-2 border-t-2 border-emerald-300" />

                  <span className="absolute -right-px -top-px h-10 w-10 rounded-tr-2xl border-r-2 border-t-2 border-emerald-300" />

                  <span className="absolute -bottom-px -left-px h-10 w-10 rounded-bl-2xl border-b-2 border-l-2 border-emerald-300" />

                  <span className="absolute -bottom-px -right-px h-10 w-10 rounded-br-2xl border-b-2 border-r-2 border-emerald-300" />

                  <div className="absolute inset-x-0 top-0 h-px animate-scan-line bg-emerald-300 shadow-[0_0_18px_3px_rgba(110,255,175,0.65)]" />

                  <div className="absolute -top-3 left-5 rounded-full bg-emerald-300 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-slate-950">
                    {t('landing.visual.scanning')}
                  </div>

                </div>

                {/* RESULT */}

                <div className="absolute bottom-5 left-5 right-5 rounded-[1.6rem] border border-white/15 bg-slate-950/70 p-4 backdrop-blur-2xl sm:bottom-6 sm:left-6 sm:right-6 sm:p-5">

                  <div className="flex items-end justify-between gap-4">

                    <div className="min-w-0">

                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
                        {t('landing.visual.prediction')}
                      </p>

                      <p className="mt-1 truncate text-[15px] font-black text-white sm:text-base">
                        {t('landing.visual.disease')}
                      </p>

                      <p className="mt-1 text-[10px] text-white/45">
                        {t('landing.visual.preliminary')}
                      </p>

                    </div>

                    <div className="shrink-0 text-right">

                      <p className="font-display text-3xl font-black tracking-[-0.04em] text-white">
                        87%
                      </p>

                      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/40">
                        {t('landing.visual.confidence')}
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-emerald-300 to-lime-300" />
                  </div>

                </div>

              </div>

              {/* FLOATING CARD */}

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl glass-panel p-3.5 shadow-2xl sm:block">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Zap className="h-5 w-5" />
                  </div>

                  <div>

                    <p className="text-[11px] font-black">
                      {t('landing.visual.fastTitle')}
                    </p>

                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      {t('landing.visual.fastDesc')}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* SCROLL LABEL */}

        <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground lg:flex">
          <ArrowDownRight className="h-3.5 w-3.5" />
          {t('landing.scroll')}
        </div>

      </motion.section>

      {/* =====================================================
          VALUE
      ====================================================== */}

      <motion.section {...motionProps} className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10 lg:py-20 xl:px-14">

        <div className="grid gap-7 lg:grid-cols-[1fr_0.55fr] lg:items-end">

          <div>
            <p className="section-kicker">
              {t('landing.value.kicker')}
            </p>

            <h2 className="section-title max-w-[780px]">
              {t('landing.value.title')}
            </h2>
          </div>

          <p className="max-w-[430px] text-sm leading-7 text-muted-foreground lg:justify-self-end">
            {t('landing.value.description')}
          </p>

        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {TRUST.map((item) => {

            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className="group relative min-h-[240px] overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-b from-card to-muted/20 p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.1)]"
              >
                {/* Top highlight bar on hover */}
                <div className="absolute inset-x-0 top-0 h-1 w-0 bg-gradient-to-r from-primary to-primary/40 transition-all duration-500 group-hover:w-full" />

                {/* Animated background glow */}
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-[40px] transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/15" />

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5 text-primary transition-all duration-500 group-hover:scale-110 group-hover:border-primary/20 group-hover:from-primary group-hover:to-primary/90 group-hover:text-primary-foreground group-hover:shadow-xl group-hover:shadow-primary/20">
                  <Icon className="h-6 w-6 transition-transform duration-500" />
                </div>

                <h3 className="relative mt-8 text-base font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                  {t(`${item.key}.title`)}
                </h3>

                <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t(`${item.key}.desc`)}
                </p>

              </div>
            );
          })}

        </div>

      </motion.section>

      {/* =====================================================
          PROCESS
      ====================================================== */}

      <motion.section {...motionProps} className="relative border-y border-border/60 bg-card/50 py-20 lg:py-24">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_45%)]" />

        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10 xl:px-14">

          <div className="mx-auto max-w-[700px] text-center">

            <p className="section-kicker">
              {t('landing.process.kicker')}
            </p>

            <h2 className="section-title">
              {t('landing.process.title')}
            </h2>

            <p className="mx-auto mt-4 max-w-[620px] text-sm leading-7 text-muted-foreground sm:text-base">
              {t('landing.process.description')}
            </p>

          </div>

          <div className="process-grid relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <div className="process-line absolute left-[12%] right-[12%] top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent lg:block" />

            {STEPS.map((step) => {

              const Icon = step.icon;

              return (
                <div
                  key={step.key}
                  className="process-card group relative rounded-[1.7rem] glass-panel p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                >

                  <div className="process-card-header flex items-center justify-between">

                    <span className="font-display text-4xl font-black tracking-[-0.08em] text-primary/10">
                      {step.number}
                    </span>

                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition duration-300 group-hover:scale-105 group-hover:rotate-2">
                      <Icon className="h-6 w-6" />
                    </div>

                  </div>

                  <h3 className="process-card-title mt-8 text-lg font-black">
                    {t(`landing.steps.${step.key}.title`)}
                  </h3>

                  <p className="process-card-description mt-2 text-sm leading-6 text-muted-foreground">
                    {t(`landing.steps.${step.key}.desc`)}
                  </p>

                </div>
              );
            })}

          </div>

          <div className="mt-10 text-center">

            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-black text-primary transition-all hover:gap-3"
            >
              {t('landing.process.link')}
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

        </div>

      </motion.section>



      {/* =====================================================
          CTA
      ====================================================== */}

      <motion.section {...motionProps} className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-24">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,hsl(var(--primary)/0.32),transparent_35%),radial-gradient(circle_at_85%_35%,rgba(45,212,191,0.14),transparent_30%)]" />

        <div className="absolute inset-0 bg-grid-leaf opacity-20" />

        <div className="relative mx-auto max-w-[900px] px-5 text-center sm:px-8">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
            <Upload className="h-6 w-6" />
          </div>

          <h2 className="mx-auto mt-7 max-w-[800px] text-[clamp(2rem,5vw,4rem)] font-black leading-[1.02] tracking-[-0.045em]">
            {t('landing.cta.title')}
          </h2>

          <p className="mx-auto mt-5 max-w-[650px] text-sm leading-7 text-white/60 sm:text-base">
            {t('landing.cta.description')}
          </p>

          <Link
            to="/signup"
            className="mt-8 inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-emerald-300 px-7 text-sm font-black text-slate-950 shadow-2xl shadow-emerald-400/20 transition duration-300 hover:-translate-y-1 hover:bg-emerald-200"
          >
            {t('landing.cta.button')}
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mx-auto mt-5 max-w-[700px] text-[10px] leading-5 text-white/35">
            {t('landing.disclaimer')}
          </p>

        </div>

      </motion.section>

    </div>
  );
}