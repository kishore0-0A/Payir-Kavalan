import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sprout, ScanLine, Calendar, Ruler, MapPin, ArrowLeft, History, Stethoscope } from 'lucide-react';
import base44 from '@/api/apiClient';
import { SUPPORTED_CROPS } from '@/lib/cropData';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';

const HEALTH = {
  healthy: { label: 'Healthy', cls: 'bg-success/15 text-success' },
  monitoring: { label: 'Monitoring', cls: 'bg-warning/15 text-warning-foreground' },
  attention: { label: 'Needs attention', cls: 'bg-warning/15 text-warning-foreground' },
  critical: { label: 'Critical', cls: 'bg-destructive/15 text-destructive' }
};

export default function CropDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Crop.get(id).then((c) => {
      setCrop(c);
      base44.entities.Diagnosis.filter({ crop_id: id }, '-created_date', 20).then(setDiagnoses).catch(() => {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-10"><div className="h-64 animate-pulse rounded-2xl bg-muted" /></div>;
  if (!crop) return <div className="mx-auto max-w-3xl px-4 py-10"><EmptyState icon={Sprout} title="Crop not found" action={<Link to="/my-crops" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Back to My Crops</Link>} /></div>;

  const cat = SUPPORTED_CROPS.find((c) => c.name.toLowerCase() === crop.crop_name?.toLowerCase());
  const health = HEALTH[crop.health_status] || HEALTH.healthy;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/my-crops')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> My Crops</button>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="relative h-48 overflow-hidden">
          {cat?.image ? <img src={cat.image} alt={crop.crop_name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-primary/10"><Sprout className="h-16 w-16 text-primary" /></div>}
          <span className={cn('absolute right-4 top-4 rounded-full px-3 py-1 text-sm font-semibold', health.cls)}>{health.label}</span>
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold">{crop.crop_name}</h1>
          {crop.variety && <p className="text-muted-foreground">{crop.variety}</p>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {crop.planting_date && <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /> Planted {new Date(crop.planting_date).toLocaleDateString()}</div>}
            {crop.field_size && <div className="flex items-center gap-2 text-sm"><Ruler className="h-4 w-4 text-muted-foreground" /> {crop.field_size}</div>}
            {crop.location && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> {crop.location}</div>}
            {crop.last_inspection && <div className="flex items-center gap-2 text-sm"><History className="h-4 w-4 text-muted-foreground" /> Last inspection {new Date(crop.last_inspection).toLocaleDateString()}</div>}
          </div>
          {crop.notes && <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">{crop.notes}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => navigate('/scan', { state: { cropId: crop.id, cropName: crop.crop_name } })} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><ScanLine className="h-4 w-4" /> Scan this crop</button>
            <Link to="/experts" className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"><Stethoscope className="h-4 w-4" /> Ask expert</Link>
          </div>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Assessments for this crop</h2>
      {diagnoses.length === 0 ? (
        <EmptyState icon={History} title="No assessments yet" description="Scan this crop to see results here." action={<button onClick={() => navigate('/scan', { state: { cropId: crop.id, cropName: crop.crop_name } })} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Check Your Crop</button>} />
      ) : (
        <div className="space-y-3">
          {diagnoses.map((d) => (
            <Link key={d.id} to={`/history/${d.id}`} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:shadow-card">
              {d.image_url && <img src={d.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{d.predicted_disease || 'Analyzing...'}</p>
                <p className="text-sm text-muted-foreground">{Math.round((d.confidence || 0) * 100)}% · {new Date(d.created_date).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}   