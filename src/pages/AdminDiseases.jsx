import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Pencil, Trash2, X } from 'lucide-react';
import base44 from '@/api/apiClient';
import { SUPPORTED_CROPS } from '@/lib/cropData';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/ui/use-toast';

const EMPTY = { name: '', crop: '', description: '', symptoms: '', causes: '', management: '', prevention: '', safety_information: '', reference: '', last_updated: new Date().toISOString().slice(0, 10) };

export default function AdminDiseases() {
  const { toast } = useToast();
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => { setLoading(true); base44.entities.Disease.list('-last_updated', 200).then((d) => { setDiseases(d || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (d) => { setEditing(d); setForm({ ...EMPTY, ...d, last_updated: (d.last_updated || new Date().toISOString().slice(0, 10)) }); setShowForm(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await base44.entities.Disease.update(editing.id, form); toast({ title: 'Disease updated' }); }
      else { await base44.entities.Disease.create(form); toast({ title: 'Disease added' }); }
      setShowForm(false); load();
    } catch (err) { toast({ title: 'Could not save', description: err.message, variant: 'destructive' }); }
  };

  const remove = async (d) => { if (!confirm(`Delete ${d.name}?`)) return; try { await base44.entities.Disease.delete(d.id); toast({ title: 'Deleted' }); load(); } catch (e) { toast({ title: 'Could not delete', description: e.message, variant: 'destructive' }); } };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Diseases</h1>
        <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"><Plus className="h-4 w-4" /> Add Disease</button>
      </div>
      {loading ? <div className="grid gap-3 sm:grid-cols-2">{[0,1,2,3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />)}</div> : diseases.length === 0 ? (
        <EmptyState icon={BookOpen} title="No diseases in the library yet." description="Add disease records to build the knowledge base." action={<button onClick={openAdd} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Add Disease</button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {diseases.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between">
                <div><p className="font-semibold">{d.name}</p><p className="text-xs text-muted-foreground">{d.crop}</p></div>
                <div className="flex gap-1"><button onClick={() => openEdit(d)} className="rounded-lg border border-border p-2 hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => remove(d)} className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button></div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.description}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center" onClick={() => setShowForm(false)}>
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-lift sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">{editing ? 'Edit disease' : 'Add disease'}</h2><button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-sm font-medium">Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
                <div><label className="mb-1 block text-sm font-medium">Crop *</label><select required value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"><option value="">Select</option>{SUPPORTED_CROPS.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
              </div>
              <div><label className="mb-1 block text-sm font-medium">Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
              <div><label className="mb-1 block text-sm font-medium">Symptoms</label><textarea rows={2} value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
              <div><label className="mb-1 block text-sm font-medium">Causes</label><textarea rows={2} value={form.causes} onChange={(e) => setForm({ ...form, causes: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
              <div><label className="mb-1 block text-sm font-medium">Management</label><textarea rows={2} value={form.management} onChange={(e) => setForm({ ...form, management: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
              <div><label className="mb-1 block text-sm font-medium">Prevention</label><textarea rows={2} value={form.prevention} onChange={(e) => setForm({ ...form, prevention: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
              <div><label className="mb-1 block text-sm font-medium">Safety information</label><textarea rows={2} value={form.safety_information} onChange={(e) => setForm({ ...form, safety_information: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-sm font-medium">Reference</label><input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
                <div><label className="mb-1 block text-sm font-medium">Last updated</label><input type="date" value={form.last_updated} onChange={(e) => setForm({ ...form, last_updated: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
              </div>
            </div>
            <div className="mt-5 flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">Cancel</button><button type="submit" className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Save</button></div>
          </form>
        </div>
      )}
    </div>
  );
}