import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import base44 from '@/api/apiClient';
import { SUPPORTED_CROPS } from '@/lib/cropData';
import { useToast } from '@/components/ui/use-toast';

export default function ExpertRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const diag = location.state?.diagnosis;
  const [form, setForm] = useState({ crop_name: '', image_url: '', ai_prediction: '', ai_confidence: 0, ai_severity: '', description: '', location: '', question: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (diag) setForm((f) => ({ ...f, crop_name: diag.crop_name || '', image_url: diag.image_url || '', ai_prediction: diag.predicted_disease || '', ai_confidence: diag.confidence || 0, ai_severity: diag.severity || '' }));
    base44.auth.me().then((u) => { if (u?.village) setForm((f) => ({ ...f, location: u.village })); }).catch(() => {});
  }, [diag]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        crop_name: form.crop_name,
        image_url: form.image_url || null,
        ai_prediction: form.ai_prediction || null,
        ai_confidence: form.ai_confidence !== undefined && form.ai_confidence !== null ? Number(form.ai_confidence) : null,
        ai_severity: form.ai_severity || null,
        description: form.description || null,
        location: form.location || null,
        question: form.question || null,
        status: 'pending'
      };
      const review = await base44.entities.ExpertReview.create(payload);
      if (diag && diag.id) {
        await base44.entities.Diagnosis.update(diag.id, { expert_requested: true }).catch(() => {});
      }
      toast({ title: 'Request submitted', description: 'An expert will review your case. You can track it under Expert Help.' });
      navigate('/experts');
    } catch (err) {
      toast({ title: 'Could not submit', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back</button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Request Expert Review</h1>
        <p className="mt-1 text-muted-foreground">Share your case with an agricultural expert for confirmation.</p>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
        {diag && (
          <div className="rounded-xl bg-primary/5 p-4 text-sm">
            <p className="font-semibold text-primary">AI result attached</p>
            <p className="text-muted-foreground">{diag.predicted_disease} · {Math.round((diag.confidence || 0) * 100)}% confidence · {diag.severity}</p>
            <p className="mt-1 text-xs text-muted-foreground">Expert confirmation is separate from this AI prediction.</p>
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Crop *</label>
          <select required value={form.crop_name} onChange={(e) => setForm({ ...form, crop_name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
            <option value="">Select crop</option>
            {SUPPORTED_CROPS.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        {form.image_url && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Image</label>
            <img src={form.image_url} alt="crop" className="h-32 w-32 rounded-xl object-cover" />
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Describe what you see</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Brown spots appeared on lower leaves after the rain..." className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Your location</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Village, District, State" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Question for the expert</label>
          <textarea rows={2} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Any specific question..." className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Request
        </button>
      </form>
    </div>
  );
}