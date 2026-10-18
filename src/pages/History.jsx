import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Search, Leaf, Trash2 } from 'lucide-react';
import base44 from '@/api/apiClient';
import { SUPPORTED_CROPS } from '@/lib/cropData';
import SeverityBadge from '@/components/SeverityBadge';
import EmptyState from '@/components/EmptyState';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

export default function History() {
  const { t } = useLanguage();
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    base44.entities.Diagnosis.list('-created_date', 200).then((d) => { setDiagnoses(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => diagnoses.filter((d) => {
    if (cropFilter && d.crop_name !== cropFilter) return false;
    if (severityFilter && d.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (d.predicted_disease || '').toLowerCase().includes(q) || (d.crop_name || '').toLowerCase().includes(q);
    }
    return true;
  }), [diagnoses, search, cropFilter, severityFilter]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 fade-up">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl font-display">{t('nav.history', 'Diagnosis History')}</h1>
        <p className="mt-1 text-muted-foreground">{t('history.subtitle', 'All your crop assessments, saved in one place.')}</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center fade-up-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('history.search', 'Search diagnosis history')} className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={cropFilter} onChange={(e) => setCropFilter(e.target.value)} className="rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
          <option value="">{t('history.allCrops', 'All crops')}</option>
          {SUPPORTED_CROPS.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
          <option value="">{t('history.allSeverity', 'All severity')}</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1,2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="fade-up-2">
          <EmptyState icon={HistoryIcon} title={t('history.emptyTitle', 'No crop assessments yet.')} description={t('history.emptyDesc', 'Scan a crop to start building your history.')} action={<Link to="/scan" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-md">Check Your Crop</Link>} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d, index) => (
            <div key={d.id} className="flex items-center gap-2 rounded-2xl border border-white/20 glass p-2 sm:p-3 shadow-soft hover-pop fade-up-2" style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}>
              <Link to={`/history/${d.id}`} className="flex min-w-0 flex-1 items-center gap-4 p-1 sm:p-2">
                {d.image_url ? <img src={d.image_url} alt="" className="h-16 w-16 rounded-xl object-cover shadow-sm shrink-0" /> : <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shrink-0"><Leaf className="h-6 w-6 text-primary" /></div>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{d.crop_name}</p>
                    <span className="text-xs text-muted-foreground">·</span>
                    <p className="truncate text-sm text-muted-foreground">{d.predicted_disease || 'Analyzing...'}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{Math.round((d.confidence || 0) * 100)}% confidence · {new Date(d.created_date).toLocaleDateString()}</p>
                </div>
                <SeverityBadge severity={d.severity} />
                <span className={cn('hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline', d.status === 'reviewed' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground')}>{d.status === 'reviewed' ? 'Reviewed' : 'Pending'}</span>
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
                className="p-2.5 mr-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                title="Delete assessment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}