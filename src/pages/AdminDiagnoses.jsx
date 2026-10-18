import React, { useEffect, useState, useMemo } from 'react';
import { ScanLine, Search } from 'lucide-react';
import base44 from '@/api/apiClient';
import EmptyState from '@/components/EmptyState';
import SeverityBadge from '@/components/SeverityBadge';
import DemoBadge from '@/components/DemoBadge';
import { cn } from '@/lib/utils';

export default function AdminDiagnoses() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.Diagnosis.list('-created_date', 500).then((d) => { setDiagnoses(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => diagnoses.filter((d) => !search || (d.predicted_disease || '').toLowerCase().includes(search.toLowerCase()) || (d.crop_name || '').toLowerCase().includes(search.toLowerCase())), [diagnoses, search]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Diagnoses</h1>
      <div className="relative mb-5 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search diagnoses" className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" /></div>
      {loading ? <div className="h-32 animate-pulse rounded-2xl bg-muted" /> : filtered.length === 0 ? (
        <EmptyState icon={ScanLine} title="No diagnoses found." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Crop</th><th className="hidden p-3 sm:table-cell">Prediction</th><th className="hidden p-3 md:table-cell">Confidence</th><th className="hidden p-3 md:table-cell">Severity</th><th className="p-3">Date</th></tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-muted/40">
                  <td className="p-3"><div className="flex items-center gap-2">{d.image_url && <img src={d.image_url} alt="" className="h-9 w-9 rounded-lg object-cover" />}<span className="font-medium">{d.crop_name}</span></div></td>
                  <td className="hidden p-3 sm:table-cell">{d.predicted_disease || '—'}</td>
                  <td className="hidden p-3 md:table-cell">{Math.round((d.confidence || 0) * 100)}%</td>
                  <td className="hidden p-3 md:table-cell"><SeverityBadge severity={d.severity} /></td>
                  <td className="p-3 text-muted-foreground">{new Date(d.created_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}