import React, { useEffect, useState, useMemo } from 'react';
import { Users, ScanLine, Stethoscope, Sprout, Clock, TrendingDown, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import base44 from '@/api/apiClient';
import { SUPPORTED_CROPS } from '@/lib/cropData';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list().catch(() => []),
      base44.entities.Diagnosis.list('-created_date', 500).catch(() => []),
      base44.entities.ExpertReview.list('-created_date', 200).catch(() => []),
      base44.entities.Disease.list().catch(() => [])
    ]).then(([u, d, r, dis]) => {
      setUsers(u || []); setDiagnoses(d || []); setReviews(r || []); setDiseases(dis || []); setLoading(false);
    });
  }, []);

  const farmers = users.filter((u) => u.role !== 'admin');
  const lowConf = diagnoses.filter((d) => (d.confidence || 0) < 0.6);
  const reviewedCount = reviews.filter((r) => r.status === 'reviewed').length;
  const verifRate = reviews.length ? Math.round((reviewedCount / reviews.length) * 100) : 0;

  const stats = [
    { icon: Users, label: 'Total Farmers', value: farmers.length, color: 'text-primary bg-primary/10' },
    { icon: ScanLine, label: 'Total Diagnoses', value: diagnoses.length, color: 'text-primary bg-primary/10' },
    { icon: Stethoscope, label: 'Active Experts', value: users.filter((u) => u.role === 'admin').length, color: 'text-primary bg-primary/10' },
    { icon: Sprout, label: 'Supported Crops', value: SUPPORTED_CROPS.length, color: 'text-primary bg-primary/10' },
    { icon: Clock, label: 'Pending Reviews', value: reviews.filter((r) => r.status === 'pending').length, color: 'text-warning-foreground bg-warning/10' }
  ];

  // Diagnoses over time (last 7 days)
  const timeData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      const count = diagnoses.filter((x) => new Date(x.created_date).toDateString() === d.toDateString()).length;
      days.push({ label, count });
    }
    return days;
  }, [diagnoses]);

  const cropDist = useMemo(() => {
    const map = {};
    diagnoses.forEach((d) => { map[d.crop_name] = (map[d.crop_name] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).slice(0, 6);
  }, [diagnoses]);

  const diseaseDist = useMemo(() => {
    const map = {};
    diagnoses.forEach((d) => { if (d.predicted_disease) map[d.predicted_disease] = (map[d.predicted_disease] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).slice(0, 6);
  }, [diagnoses]);

  const PIE_COLORS = ['hsl(149 65% 30%)', 'hsl(38 92% 50%)', 'hsl(142 76% 36%)', 'hsl(28 43% 40%)', 'hsl(0 72% 51%)', 'hsl(215 16% 47%)'];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}><Icon className="h-5 w-5" /></span>
              <p className="mt-3 text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-muted" />
      ) : diagnoses.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="font-semibold">No data yet</p>
          <p className="text-sm text-muted-foreground">Charts will populate as farmers use the app. Statistics reflect real records, not fabricated figures.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-4 font-semibold">Diagnoses over time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timeData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))' }} /><Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-4 font-semibold">Crop distribution</h3>
            {cropDist.length === 0 ? <p className="text-sm text-muted-foreground">No data</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart><Pie data={cropDist} dataKey="value" nameKey="name" outerRadius={80} label={(e) => e.name}>{cropDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 12 }} /></PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-4 font-semibold">Disease distribution</h3>
            {diseaseDist.length === 0 ? <p className="text-sm text-muted-foreground">No data</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={diseaseDist} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" /><XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" /><YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" /><Tooltip contentStyle={{ borderRadius: 12 }} /><Bar dataKey="value" fill="hsl(38 92% 50%)" radius={[0, 6, 6, 0]} /></BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><TrendingDown className="h-5 w-5" /></span>
              <p className="mt-3 text-3xl font-bold">{lowConf.length}</p>
              <p className="text-sm text-muted-foreground">Low-confidence predictions</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success"><CheckCircle2 className="h-5 w-5" /></span>
              <p className="mt-3 text-3xl font-bold">{verifRate}%</p>
              <p className="text-sm text-muted-foreground">Expert verification rate</p>
            </div>
          </div>
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">Statistics reflect real records in the system. Empty states are shown where no data exists — no fabricated figures are displayed.</p>
    </div>
  );
}