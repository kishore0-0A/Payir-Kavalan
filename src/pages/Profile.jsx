import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Sprout, Save, LogOut, ShieldCheck, Lock, ScanLine, Volume2, BellRing, WifiOff, Play, Globe } from 'lucide-react';
import base44 from '@/api/apiClient';
import { useToast } from '@/components/ui/use-toast';
import { useVoice } from '@/lib/voice';
import { useLanguage } from '@/lib/i18n';
import { useOnline } from '@/lib/useOnline';
import { cn } from '@/lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { speak, supported } = useVoice();
  const { lang, setLang, languages } = useLanguage();
  const online = useOnline();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: '', mobile: '', village: '', primary_crop: '', role: 'farmer' });
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({ inspection: true, weather: true, risk: true });
  
  // Stats
  const [totalCrops, setTotalCrops] = useState(0);
  const [totalScans, setTotalScans] = useState(0);

  // Password state
  const [passForm, setPassForm] = useState({ old_password: '', new_password: '' });
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u) {
        setForm({ full_name: u.full_name || '', mobile: u.mobile || '', village: u.village || '', primary_crop: u.primary_crop || '', role: u.role || 'farmer' });
        if (u.alert_prefs) setPrefs(u.alert_prefs);
      }
    }).catch(() => {});

    // Fetch stats
    base44.entities.Crop.list().then(c => setTotalCrops(c?.length || 0));
    base44.entities.Diagnosis.list().then(d => setTotalScans(d?.length || 0));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: form.full_name, mobile: form.mobile, village: form.village, primary_crop: form.primary_crop, role: form.role });
      const updated = await base44.auth.me();
      setUser(updated);
      toast({ title: 'Profile updated' });
    } catch (err) { toast({ title: 'Could not save', description: err.message, variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!passForm.old_password || !passForm.new_password) return;
    setSavingPass(true);
    try {
      await base44.auth.changePassword(passForm.old_password, passForm.new_password);
      toast({ title: 'Password changed successfully' });
      setPassForm({ old_password: '', new_password: '' });
    } catch (err) { toast({ title: 'Password change failed', description: err.message, variant: 'destructive' }); }
    finally { setSavingPass(false); }
  };

  const togglePref = async (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try { await base44.auth.updateMe({ alert_prefs: next }); } catch (e) {}
  };

  const logout = async () => { await base44.auth.logout(); navigate('/login'); };

  const toggles = [
    { key: 'inspection', label: 'Crop inspection reminders', desc: 'Reminders to check your crops.' },
    { key: 'weather', label: 'Weather alerts', desc: 'Rain, heat and humidity advisories.' },
    { key: 'risk', label: 'Disease-risk notifications', desc: 'Advisories when conditions favour disease.' }
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl font-display fade-up">Account & Settings</h1>

      {/* Header Profile */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop fade-up-1">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {(form.full_name || user?.email || 'F').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold">{form.full_name || 'Farmer'}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold capitalize text-primary">{user?.role || 'user'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 fade-up-1">
        <div className="rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full"><Sprout className="h-6 w-6 text-primary" /></div>
          <div><p className="text-2xl font-bold">{totalCrops}</p><p className="text-sm text-muted-foreground">Total Crops</p></div>
        </div>
        <div className="rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full"><ScanLine className="h-6 w-6 text-primary" /></div>
          <div><p className="text-2xl font-bold">{totalScans}</p><p className="text-sm text-muted-foreground">AI Scans</p></div>
        </div>
      </div>

      {/* Profile Form */}
      <h2 className="mb-3 text-lg font-semibold fade-up-2">Personal Details</h2>
      <form onSubmit={saveProfile} className="mb-8 space-y-4 rounded-2xl border border-white/20 glass p-6 shadow-2xl fade-up-2 hover-pop">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><User className="h-4 w-4 text-muted-foreground" /> Full name</label>
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Mail className="h-4 w-4 text-muted-foreground" /> Email</label>
          <input value={user?.email || ''} disabled className="w-full rounded-lg border border-input bg-muted px-4 py-2.5 text-sm text-muted-foreground" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Phone className="h-4 w-4 text-muted-foreground" /> Mobile number</label>
          <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 90000 00000" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><MapPin className="h-4 w-4 text-muted-foreground" /> Location</label>
          <input value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} placeholder="Village, District, State" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Sprout className="h-4 w-4 text-muted-foreground" /> Primary crop</label>
          <input value={form.primary_crop} onChange={(e) => setForm({ ...form, primary_crop: e.target.value })} placeholder="e.g. Tomato" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><User className="h-4 w-4 text-muted-foreground" /> Account Type</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="farmer">Farmer — Crop health & AI diagnosis</option>
            <option value="expert">Agricultural Expert — Case reviews & advisory</option>
            <option value="admin">Administrator — System operations & management</option>
          </select>
        </div>
        {user?.role === 'expert' && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-primary">Expert Portal Available</p>
              <p className="text-xs text-muted-foreground">Access your incoming farmer cases & reviews queue.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/expert/dashboard')}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Open Expert Panel &rarr;
            </button>
          </div>
        )}
        <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile'}</button>
      </form>

      {/* Security (Change Password) */}
      <h2 className="mb-3 text-lg font-semibold fade-up-2">Security</h2>
      <form onSubmit={changePassword} className="mb-8 space-y-4 rounded-2xl border border-white/20 glass p-6 shadow-2xl fade-up-2 hover-pop">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Lock className="h-4 w-4 text-muted-foreground" /> Current Password</label>
          <input type="password" value={passForm.old_password} onChange={(e) => setPassForm({ ...passForm, old_password: e.target.value })} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Lock className="h-4 w-4 text-muted-foreground" /> New Password</label>
          <input type="password" value={passForm.new_password} onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <button type="submit" disabled={savingPass} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary px-5 py-3 font-semibold hover:bg-primary/20 disabled:opacity-60">{savingPass ? 'Updating...' : 'Change Password'}</button>
      </form>

      {/* Preferences merged from Settings */}
      <h2 className="mb-3 text-lg font-semibold fade-up-3">Preferences</h2>

      <div className="mb-5 rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop fade-up-3">
        <h2 className="flex items-center gap-2 font-semibold"><Globe className="h-5 w-5 text-primary" /> Display Language</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select your preferred language for the entire platform.</p>
        <div className="mt-4">
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)} 
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {languages.filter(l => ['en', 'ta', 'hi'].includes(l.code)).map((l) => (
              <option key={l.code} value={l.code}>{l.native} ({l.label})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop fade-up-3">
        <h2 className="flex items-center gap-2 font-semibold"><Volume2 className="h-5 w-5 text-primary" /> Voice assistance</h2>
        <p className="mt-1 text-sm text-muted-foreground">Listen to results and guidance aloud using your device's text-to-speech.</p>
        <button onClick={() => { speak('Voice assistance is working.'); toast({ title: 'Playing sample' }); }} disabled={!supported} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-50">
          <Play className="h-4 w-4" /> Test voice
        </button>
        {!supported && <p className="mt-2 text-xs text-muted-foreground">Voice is not supported on this device.</p>}
      </div>

      <div className="mb-5 rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop fade-up-3">
        <h2 className="flex items-center gap-2 font-semibold"><BellRing className="h-5 w-5 text-primary" /> Alert preferences</h2>
        <div className="mt-4 space-y-3">
          {toggles.map((t) => (
            <label key={t.key} className="flex items-center justify-between rounded-xl border border-border p-4">
              <div><p className="font-semibold">{t.label}</p><p className="text-sm text-muted-foreground">{t.desc}</p></div>
              <button type="button" onClick={() => togglePref(t.key)} className={cn('relative h-7 w-12 rounded-full transition', prefs[t.key] ? 'bg-primary' : 'bg-muted')}>
                <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', prefs[t.key] ? 'left-6' : 'left-1')} />
              </button>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop fade-up-3">
        <h2 className="flex items-center gap-2 font-semibold"><WifiOff className="h-5 w-5 text-primary" /> Connectivity</h2>
        <div className="mt-3 flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full', online ? 'bg-success' : 'bg-destructive')} />
          <span className="text-sm font-medium">{online ? 'Online' : 'Offline mode'}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">When offline, you can view saved diagnoses and crops, and queue scans for later.</p>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop fade-up-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" /> Your data is private.</div>
        <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
    </div>
  );
}
