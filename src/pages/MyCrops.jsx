import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout, Plus, ScanLine, Pencil, Trash2, MapPin, Calendar, Ruler,
  Eye, X
} from 'lucide-react';
import base44 from '@/api/apiClient';
import { SUPPORTED_CROPS } from '@/lib/cropData';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const HEALTH = {
  healthy: { label: 'Healthy', cls: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  monitoring: { label: 'Monitoring', cls: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  attention: { label: 'Needs attention', cls: 'bg-orange-500/15 text-orange-700 border-orange-500/30' },
  critical: { label: 'Critical', cls: 'bg-rose-500/15 text-rose-700 border-rose-500/30' }
};

const EMPTY = { crop_name: '', variety: '', planting_date: '', field_size: '', location: '', notes: '' };

export default function MyCrops() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.Crop.list('-created_date', 100)
      .then((c) => {
        setCrops(c || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showForm]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (crop) => {
    setEditing(crop);
    setForm({
      crop_name: crop.crop_name || crop.name || '',
      variety: crop.variety || '',
      planting_date: crop.planting_date || '',
      field_size: crop.field_size || crop.area || '',
      location: crop.location || '',
      notes: crop.notes || ''
    });
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.crop_name.trim()) {
      toast({ title: 'Crop name required', description: 'Please enter or select a crop name.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.Crop.update(editing.id, form);
        toast({ title: 'Crop updated successfully' });
      } else {
        await base44.entities.Crop.create({ ...form, health_status: 'healthy' });
        toast({ title: 'New crop added to your farm' });
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast({ title: 'Could not save crop', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (crop) => {
    const cName = crop.crop_name || crop.name || 'this crop';
    if (!confirm(`Are you sure you want to remove ${cName}?`)) return;
    try {
      await base44.entities.Crop.delete(crop.id);
      toast({ title: 'Crop removed' });
      load();
    } catch (err) {
      toast({ title: 'Could not delete', description: err.message, variant: 'destructive' });
    }
  };

  const healthyCount = crops.filter((c) => (c.health_status || 'healthy') === 'healthy').length;
  const attentionCount = crops.length - healthyCount;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Banner & Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sprout className="h-4 w-4" />
            <span>Farm Plots & Field Records</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Crops
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your planted parcels, track field health, and perform targeted AI diagnosis.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Crop</span>
        </button>
      </div>

      {/* Quick Overview Stats */}
      {crops.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">Total Parcels</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{crops.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm">
            <p className="text-xs font-medium text-emerald-700">Healthy Crops</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{healthyCount}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm">
            <p className="text-xs font-medium text-amber-700">Under Monitoring</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{attentionCount}</p>
          </div>
        </div>
      )}

      {/* Main Grid or Loading / Empty States */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-card/60 p-4" />
          ))}
        </div>
      ) : crops.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sprout className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">You haven't added any crops yet</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Register your planted fields here to link future AI leaf scans directly to specific plots, monitor growth progress, and track health history.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Add Your First Crop
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((crop) => {
            const cropDisplayName = crop.crop_name || crop.name || 'Crop';
            const cat = SUPPORTED_CROPS.find(
              (c) => c.name.toLowerCase() === cropDisplayName.toLowerCase()
            );
            const health = HEALTH[crop.health_status] || HEALTH.healthy;

            return (
              <div
                key={crop.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md hover:border-primary/40"
              >
                {/* Crop Card Image Banner */}
                <div className="relative h-36 w-full overflow-hidden bg-muted">
                  {cat?.image ? (
                    <img
                      src={cat.image}
                      alt={cropDisplayName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
                      <Sprout className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <span className={cn(
                    'absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border backdrop-blur-md',
                    health.cls
                  )}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {health.label}
                  </span>

                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-lg font-bold drop-shadow-sm">{cropDisplayName}</h3>
                    {crop.variety && (
                      <p className="text-xs font-medium text-white/90 drop-shadow-sm">
                        Variety: {crop.variety}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-1 flex-col p-4 justify-between">
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {crop.planting_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-foreground/70" />
                        <span>Planted on {new Date(crop.planting_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {(crop.field_size || crop.area) && (
                      <div className="flex items-center gap-2">
                        <Ruler className="h-3.5 w-3.5 text-foreground/70" />
                        <span>Size: {crop.field_size || crop.area}</span>
                      </div>
                    )}
                    {crop.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-foreground/70" />
                        <span>Plot: {crop.location}</span>
                      </div>
                    )}
                    {crop.notes && (
                      <p className="mt-2 line-clamp-2 rounded-lg bg-muted/40 p-2 text-xs text-foreground/80 italic">
                        "{crop.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="mt-5 flex items-center gap-2 border-t border-border pt-3">
                    <Link
                      to={`/my-crops/${crop.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/80"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>

                    <button
                      onClick={() => navigate('/scan', { state: { cropId: crop.id, cropName: cropDisplayName } })}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
                    >
                      <ScanLine className="h-3.5 w-3.5" /> Scan
                    </button>

                    <button
                      onClick={() => openEdit(crop)}
                      className="inline-flex items-center justify-center rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => remove(crop)}
                      className="inline-flex items-center justify-center rounded-xl border border-border p-2 text-destructive hover:bg-destructive/10 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal with Portal for 100% True Fullscreen Coverage & Perfect Centering */}
      {showForm && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/65 p-4 sm:p-6 backdrop-blur-sm"
          style={{ width: '100vw', height: '100vh', margin: 0, top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="relative my-auto w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">
                    {editing ? 'Edit Crop Details' : 'Add a New Crop'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Enter the parcel details to start health tracking
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={save} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Crop Name <span className="text-primary">*</span>
                </label>
                <input
                  list="crop-list"
                  required
                  value={form.crop_name}
                  onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
                  placeholder="e.g. Tomato, Rice, Maize..."
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <datalist id="crop-list">
                  {SUPPORTED_CROPS.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Variety / Cultivar
                  </label>
                  <input
                    value={form.variety}
                    onChange={(e) => setForm({ ...form, variety: e.target.value })}
                    placeholder="e.g. Pusa Ruby"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Planting Date
                  </label>
                  <input
                    type="date"
                    value={form.planting_date}
                    onChange={(e) => setForm({ ...form, planting_date: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Field Size
                  </label>
                  <input
                    value={form.field_size}
                    onChange={(e) => setForm({ ...form, field_size: e.target.value })}
                    placeholder="e.g. 1 acre, 0.5 ha"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Field Location
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. North Plot, Plot #2"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Field Notes / Observations
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Record soil type, irrigation schedule, or specific notes..."
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}