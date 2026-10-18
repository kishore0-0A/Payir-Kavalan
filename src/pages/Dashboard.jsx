import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ScanLine, Sprout, History, Stethoscope, CloudSun,
  ShieldAlert, AlertTriangle, ArrowRight, Leaf, Trash2
} from 'lucide-react';
import base44 from '@/api/apiClient';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';
import { fetchWeather } from '@/lib/weather';
import CropHealthTrend from '@/components/CropHealthTrend';

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, greetingName } = useOutletContext();
  const [crops, setCrops] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Crop.list('-created_date', 50).catch(() => []),
      base44.entities.Diagnosis.list('-created_date', 50).catch(() => []),
      base44.entities.Reminder.filter({ status: 'pending' }, 'reminder_date', 5).catch(() => [])
    ]).then(([c, d, r]) => {
      setCrops(c || []);
      setDiagnoses(d || []);
      setReminders(r || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user) {
      const location = user.village || 'New Delhi, IN';
      fetchWeather(location).then((data) => {
        setWeather(data);
        setWeatherLoading(false);
      });
    }
  }, [user]);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = greetingName || (user?.full_name?.split(' ')[0]) || 'Farmer';

  const latest = diagnoses[0];
  const todayReminder = reminders.find((r) => new Date(r.reminder_date) <= new Date(Date.now() + 86400000));

  const cards = [
    { icon: Sprout, title: 'My Crops', value: crops.length, sub: crops.length ? `${crops.filter(c => c.health_status === 'healthy').length} healthy` : 'No crops yet', to: '/my-crops', color: 'text-primary' },
    { icon: History, title: 'Recent Diagnosis', value: latest?.predicted_disease || '—', sub: latest ? `${Math.round((latest.confidence || 0) * 100)}% confidence` : 'No assessments yet', to: '/history', color: 'text-foreground' },
    { icon: ShieldAlert, title: 'Disease Risk', value: weather && weather.humidity > 70 ? 'Moderate' : 'Low', sub: weather && weather.humidity > 70 ? 'High humidity advisory' : 'Normal conditions', to: '/alerts', color: weather && weather.humidity > 70 ? 'text-warning-foreground' : 'text-success' },
    { icon: CloudSun, title: 'Weather', value: weather ? weather.condition : 'Loading...', sub: weather ? `${weather.temp}°C, ${weather.rain}% rain prob.` : 'Please wait', to: '/alerts', color: 'text-primary' }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Greeting */}
      <div className="mb-6 fade-up">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl font-display">{greet}, <span className="text-gradient">{name}</span></h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: main CTA + cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Agronomic Clinical Banner */}
          <div className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-[#0c3b24] via-[#114b2e] to-[#0a2f1c] p-7 text-white shadow-xl border border-emerald-500/20 hover-pop fade-up-1 sm:p-8 isolate">
            {/* Elegant Organic Texture & Vignette */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold sm:text-3xl tracking-tight text-white font-display">
                  Diagnose Crop Health & Get Prescriptions
                </h2>
                
                <p className="mt-2 text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                  Upload a clear field leaf photo to detect fungal, bacterial, or pest damage with verified chemical and organic treatment protocols.
                </p>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => navigate('/scan')} 
                    className="group inline-flex items-center gap-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 px-6 py-3.5 font-bold text-emerald-950 shadow-lg shadow-emerald-950/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ScanLine className="h-5 w-5 text-emerald-950 transition-transform group-hover:scale-110" /> 
                    <span>Upload Leaf & Begin Diagnosis</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button 
                    onClick={() => navigate('/experts')}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-3.5 text-xs font-semibold text-white backdrop-blur-md border border-white/15 transition active:scale-95"
                  >
                    <Stethoscope className="h-4 w-4 text-emerald-300" />
                    <span>Talk to Plant Doctor</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-3 fade-up-2">
            {[
              { icon: Sprout, label: 'My Crops', to: '/my-crops' },
              { icon: History, label: 'History', to: '/history' },
              { icon: Stethoscope, label: 'Expert Help', to: '/experts' }
            ].map((a) => {
              const Icon = a.icon;
              return (
                <button key={a.to} onClick={() => navigate(a.to)} className="flex flex-col items-center gap-2 rounded-2xl border border-white/20 glass p-4 shadow-soft hover-pop active:scale-95">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                  <span className="text-sm font-semibold">{a.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dashboard cards */}
          <div className="grid gap-4 sm:grid-cols-2 fade-up-3">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.title} to={c.to} className="group rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop">
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"><Icon className={cn('h-5 w-5', c.color)} /></span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{c.title}</p>
                  <p className="mt-0.5 text-lg font-bold text-foreground truncate">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.sub}</p>
                </Link>
              );
            })}
          </div>

          {/* Recent diagnosis list */}
          <div className="fade-up-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent assessments</h3>
              <Link to="/history" className="text-sm font-semibold text-primary hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="h-24 animate-pulse rounded-2xl bg-muted" />
            ) : diagnoses.length === 0 ? (
              <EmptyState icon={Leaf} title="No crop assessments yet" description="Scan a crop to see your first preliminary assessment here." action={<button onClick={() => navigate('/scan')} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Check Your Crop</button>} />
            ) : (
              <div className="space-y-3">
                {diagnoses.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center gap-2 rounded-2xl border border-white/20 glass p-2 sm:p-3 shadow-soft hover-pop">
                    <Link to={`/history/${d.id}`} className="flex min-w-0 flex-1 items-center gap-4 p-1">
                      {d.image_url && <img src={d.image_url} alt="" className="h-14 w-14 rounded-xl object-cover shadow-sm shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{d.crop_name} · {d.predicted_disease || 'Analyzing...'}</p>
                        <p className="text-sm text-muted-foreground">{Math.round((d.confidence || 0) * 100)}% confidence · {new Date(d.created_date).toLocaleDateString()}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm('Delete this assessment from history?')) {
                          try {
                            await base44.entities.Diagnosis.delete(d.id);
                            setDiagnoses((prev) => prev.filter((item) => item.id !== d.id));
                          } catch (err) {
                            console.error('Failed to delete diagnosis:', err);
                          }
                        }
                      }}
                      className="p-2.5 mr-1 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                      title="Delete assessment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: weather + alerts */}
        <div className="space-y-6 fade-up-5">
          {/* Weather card */}
          <div className="rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Current weather</h3>
              {weatherLoading ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">Loading</span>
              ) : (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-success">Live</span>
              )}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <CloudSun className="h-12 w-12 text-primary" />
              <div>
                <p className="text-3xl font-bold">{weather ? weather.temp : '--'}°C</p>
                <p className="text-sm text-muted-foreground capitalize">{weather ? weather.description : 'Loading...'}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Humidity</p><p className="font-semibold">{weather ? weather.humidity : '--'}%</p></div>
              <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Rain probability</p><p className="font-semibold">{weather ? weather.rain : '--'}%</p></div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Location: {user?.village || 'New Delhi, IN'}</p>
          </div>

          {/* Disease risk */}
          <div className={`rounded-2xl border ${weather && weather.humidity > 70 ? 'border-warning/40 bg-warning/10' : 'border-success/40 bg-success/10'} p-5 hover-pop glass`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${weather && weather.humidity > 70 ? 'text-warning-foreground' : 'text-success'}`} />
              <h3 className={`font-semibold ${weather && weather.humidity > 70 ? 'text-warning-foreground' : 'text-success'}`}>Disease risk advisory</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {weather && weather.humidity > 70 
                ? 'Moderate risk — high humidity may increase the likelihood of some fungal disease conditions.' 
                : 'Low risk — current weather conditions are not highly favorable for widespread fungal diseases.'}
            </p>
            <Link to="/alerts" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View alerts <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>

          {/* Crop health trend interactive component */}
          <CropHealthTrend diagnoses={diagnoses} crops={crops} />
        </div>
      </div>
    </div>
  );
}