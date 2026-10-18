import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, MapPin, Sprout, Languages, BellRing, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import base44 from '@/api/apiClient';
import { SUPPORTED_CROPS } from '@/lib/cropData';
import { LANGUAGES } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ location: '', crops: [], language: 'en', alerts: { inspection: true, weather: true, risk: true } });

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u) setForm((f) => ({ ...f, location: u.village || '' }));
    }).catch(() => {});
  }, []);

  const toggleCrop = (name) => {
    setForm((f) => ({
      ...f,
      crops: f.crops.includes(name) ? f.crops.filter((c) => c !== name) : [...f.crops, name]
    }));
  };

  const finish = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ village: form.location, preferred_language: form.language, onboarding_done: true });
      try {
        if (form.crops.length) {
          if (base44.entities.Crop.bulkCreate) {
            await base44.entities.Crop.bulkCreate(
              form.crops.map((name) => ({ crop_name: name, planting_date: new Date().toISOString().slice(0, 10), health_status: 'healthy' }))
            );
          } else if (base44.entities.Crop.create) {
             await Promise.all(form.crops.map(name => base44.entities.Crop.create({ name, planting_date: new Date().toISOString().slice(0, 10), health_status: 'healthy' })));
          }
        }
      } catch (e) {
        console.warn("Crop creation not supported yet");
      }

      const notifs = [];
      if (form.alerts.inspection) notifs.push({ type: 'inspection', title: 'Welcome to Payir Kaavalan', message: 'Add your crops and set inspection reminders to stay on track.', read: false });
      if (form.alerts.weather) notifs.push({ type: 'weather', title: 'Weather alerts enabled', message: 'We will notify you about weather that may affect your crops.', read: false });
      if (form.alerts.risk) notifs.push({ type: 'advisory', title: 'Disease-risk alerts enabled', message: 'You will receive advisories when conditions favour disease.', read: false });
      
      try {
        if (notifs.length && base44.entities.Notification?.bulkCreate) {
           await base44.entities.Notification.bulkCreate(notifs);
        }
      } catch (e) {
        console.warn("Notification creation not supported yet");
      }
      toast({ title: 'All set!', description: 'Welcome to your farm dashboard.' });
      window.location.href = '/dashboard';
    } catch (e) {
      toast({ title: 'Could not save', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const STEPS = ['Location', 'Your crops', 'Language', 'Alerts'];
  const canNext = step === 0 ? form.location.trim() : step === 1 ? form.crops.length > 0 : true;

  return (
    <div className="min-h-screen bg-background bg-grid-leaf">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
        <div className="mb-8 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Leaf className="h-5 w-5" /></span>
          <span className="text-lg font-bold">Payir <span className="text-primary">Kaavalan</span></span>
        </div>

        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition', i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={cn('h-0.5 flex-1 rounded-full', i < step ? 'bg-primary' : 'bg-muted')} />}
            </div>
          ))}
        </div>

        <div className="flex-1 rounded-2xl border border-border bg-card p-6 shadow-card animate-fade-in">
          {step === 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary"><MapPin className="h-5 w-5" /><h2 className="text-xl font-semibold">Where is your farm?</h2></div>
              <p className="mb-5 text-sm text-muted-foreground">We'll personalise your weather updates.</p>
              <label className="mb-1.5 block text-sm font-medium">Location (village, district, state)</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Thanjavur, Tamil Nadu" className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary"><Sprout className="h-5 w-5" /><h2 className="text-xl font-semibold">What do you grow?</h2></div>
              <p className="mb-5 text-sm text-muted-foreground">Select all the crops you cultivate. You can add more later.</p>
              <div className="grid grid-cols-2 gap-3">
                {SUPPORTED_CROPS.map((c) => {
                  const active = form.crops.includes(c.name);
                  return (
                    <button key={c.id} type="button" onClick={() => toggleCrop(c.name)} className={cn('flex items-center gap-3 rounded-xl border p-3 text-left transition', active ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border hover:bg-muted')}>
                      <img src={c.image} alt={c.name} className="h-10 w-10 rounded-lg object-cover" />
                      <span className="flex-1 text-sm font-semibold">{c.name}</span>
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary"><Languages className="h-5 w-5" /><h2 className="text-xl font-semibold">Choose your language</h2></div>
              <p className="mb-5 text-sm text-muted-foreground">You can change this anytime in settings.</p>
              <div className="space-y-2">
                {LANGUAGES.map((l) => (
                  <button key={l.code} type="button" onClick={() => setForm({ ...form, language: l.code })} className={cn('flex w-full items-center justify-between rounded-xl border p-4 transition', form.language === l.code ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border hover:bg-muted')}>
                    <span className="font-semibold">{l.native}</span>
                    <span className="text-sm text-muted-foreground">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary"><BellRing className="h-5 w-5" /><h2 className="text-xl font-semibold">Enable helpful alerts</h2></div>
              <p className="mb-5 text-sm text-muted-foreground">Stay ahead with timely reminders.</p>
              <div className="space-y-3">
                {[
                  { key: 'inspection', label: 'Crop inspection reminders', desc: 'Reminders to check your crops regularly.' },
                  { key: 'weather', label: 'Weather alerts', desc: 'Rain, heat and humidity advisories.' },
                  { key: 'risk', label: 'Disease-risk notifications', desc: 'Advisories when conditions favour disease.' }
                ].map((a) => (
                  <label key={a.key} className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div>
                      <p className="font-semibold">{a.label}</p>
                      <p className="text-sm text-muted-foreground">{a.desc}</p>
                    </div>
                    <button type="button" onClick={() => setForm({ ...form, alerts: { ...form.alerts, [a.key]: !form.alerts[a.key] } })} className={cn('relative h-7 w-12 rounded-full transition', form.alerts[a.key] ? 'bg-primary' : 'bg-muted')}>
                      <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', form.alerts[a.key] ? 'left-6' : 'left-1')} />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : <span />}
          {step < 3 ? (
            <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:opacity-50 active:scale-95">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={finish} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lift transition hover:bg-primary/90 disabled:opacity-50 active:scale-95">
              {saving ? 'Saving...' : 'Go to My Farm'} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
