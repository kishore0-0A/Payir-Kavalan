import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import base44 from '@/api/apiClient';
import DiagnosisDetail from '@/components/DiagnosisDetail';
import EmptyState from '@/components/EmptyState';

export default function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diag, setDiag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Diagnosis.get(id).then((d) => { setDiag(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10"><div className="h-64 animate-pulse rounded-2xl bg-muted" /></div>;
  if (!diag) return <div className="mx-auto max-w-2xl px-4 py-10"><EmptyState icon={History} title="Diagnosis not found" action={<Link to="/history" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Back to history</Link>} /></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/history')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> History</button>
      <DiagnosisDetail diagnosis={diag} />
    </div>
  );
}