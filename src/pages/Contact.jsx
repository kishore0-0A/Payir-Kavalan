import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n';

export default function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: '', email: '', message: '' });
      toast({ title: 'Message sent', description: "We'll get back to you shortly. Thank you!" });
    }, 800);
  };

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-grid-leaf">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <MessageSquare className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{t('pages.contact.title')}</h1>
          <p className="mt-4 text-lg text-muted-foreground text-balance">{t('pages.contact.subtitle')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {[
              { icon: Mail, label: 'pages.contact.email', value: 'hello@payirkaavalan.in' },
              { icon: Phone, label: 'pages.contact.phone', value: '+91 80000 00000' },
              { icon: MapPin, label: 'pages.contact.location', value: 'Serving rural India' }
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="group relative flex items-center gap-5 overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-r from-card to-muted/10 p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                  <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-primary/5 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5 text-primary transition-all duration-500 group-hover:scale-110 group-hover:border-primary/20 group-hover:from-primary group-hover:to-primary/90 group-hover:text-primary-foreground group-hover:shadow-md">
                    <Icon className="h-6 w-6 transition-transform duration-500" />
                  </span>
                  <div className="relative">
                    <p className="text-sm text-muted-foreground">{t(c.label)}</p>
                    <p className="font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">{c.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={submit} className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-gradient-to-b from-card to-muted/10 p-8 shadow-sm sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-[60px]" />
            <div className="relative space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t('pages.contact.name')}</label>
                <input
                  required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Farmer name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t('pages.contact.email')}</label>
                <input
                  required type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t('pages.contact.message')}</label>
                <textarea
                  required rows={4} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit" disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 active:scale-95"
              >
                <Send className="h-5 w-5" /> {sending ? 'Sending...' : t('pages.contact.send')}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}