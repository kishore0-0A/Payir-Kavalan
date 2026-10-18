import React, { useEffect, useState, useMemo } from 'react';
import { 
  BookOpen, Search, X, Leaf, ShieldAlert, Sparkles, CheckCircle2, 
  ExternalLink, FileText, Pill, ArrowRight, Calendar, AlertTriangle
} from 'lucide-react';
import base44 from '@/api/apiClient';
import { SUPPORTED_CROPS } from '@/lib/cropData';
import EmptyState from '@/components/EmptyState';
import { cn } from '@/lib/utils';

export default function Knowledge() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.Disease.list('-last_updated', 200)
      .then((d) => {
        setDiseases(d || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => diseases.filter((d) => {
    if (cropFilter && d.crop.toLowerCase() !== cropFilter.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (d.name || '').toLowerCase().includes(q) ||
        (d.crop || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q) ||
        (d.symptoms || '').toLowerCase().includes(q)
      );
    }
    return true;
  }), [diseases, search, cropFilter]);

  // Crop category chips
  const cropTags = ['All', ...new Set(diseases.map(d => d.crop).filter(Boolean))];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-card p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Agronomic Reference Compendium</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-display">
            Disease Knowledge Base
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Verified agricultural pathology library covering symptoms, pathogen biology, cultural management, and chemical treatment guidelines across major crops.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search by pathogen, symptoms, or crop..." 
              className="w-full rounded-2xl border border-input bg-card py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-soft transition-all" 
            />
          </div>

          <select 
            value={cropFilter} 
            onChange={(e) => setCropFilter(e.target.value)} 
            className="rounded-2xl border border-input bg-card px-4 py-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-soft"
          >
            <option value="">All Crop Types ({diseases.length})</option>
            {SUPPORTED_CROPS.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Quick Crop Filter Chips */}
        {cropTags.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {cropTags.map((tag) => {
              const active = tag === 'All' ? !cropFilter : cropFilter.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => setCropFilter(tag === 'All' ? '' : tag)}
                  className={cn(
                    "rounded-xl px-3.5 py-1.5 font-semibold transition-all shrink-0",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid of Disease Articles */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl bg-muted/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          icon={BookOpen} 
          title="No pathology records found" 
          description="Try searching with a different term or clearing the crop filter." 
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className="group text-left flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 shadow-soft transition-all duration-200 hover:border-primary/50 hover:shadow-card hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {d.crop}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                  {d.name}
                </h3>

                <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {d.description || d.symptoms || 'Click to view diagnosis signs, pathogen causes, and verified treatment steps.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Leaf className="h-3 w-3 text-primary" /> Management Available
                </span>
                {d.reference && (
                  <span className="truncate max-w-[120px] opacity-75">{d.reference}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Comprehensive Pathology Detail Modal */}
      {selected && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelected(null)}
        >
          <div 
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl sm:rounded-3xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-6 flex items-start justify-between border-b border-border/60 pb-4">
              <div>
                <span className="inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary mb-2">
                  {selected.crop} Pathology
                </span>
                <h2 className="text-2xl font-extrabold text-foreground font-display">
                  {selected.name}
                </h2>
              </div>
              <button 
                onClick={() => setSelected(null)} 
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Sections */}
            <div className="space-y-5 text-sm">
              {selected.description && (
                <div className="rounded-2xl bg-muted/30 p-4 border border-border/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Pathology Overview
                  </p>
                  <p className="text-foreground leading-relaxed">{selected.description}</p>
                </div>
              )}

              {selected.symptoms && (
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Characteristic Symptoms
                  </h3>
                  <p className="rounded-xl bg-card border border-border/80 p-3.5 text-foreground leading-relaxed">
                    {selected.symptoms}
                  </p>
                </div>
              )}

              {selected.causes && (
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                    Pathogen Biology & Favourable Conditions
                  </h3>
                  <p className="rounded-xl bg-card border border-border/80 p-3.5 text-foreground leading-relaxed">
                    {selected.causes}
                  </p>
                </div>
              )}

              {selected.management && (
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-primary mb-1.5 flex items-center gap-1.5">
                    <Pill className="h-4 w-4 text-primary" /> Recommended Treatments & Chemical Controls
                  </h3>
                  <p className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-foreground leading-relaxed font-medium">
                    {selected.management}
                  </p>
                </div>
              )}

              {selected.prevention && (
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-600 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Cultural & Preventive Practices
                  </h3>
                  <p className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 text-foreground leading-relaxed">
                    {selected.prevention}
                  </p>
                </div>
              )}

              {/* Future possibilities & prognosis */}
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
                <p className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-400 text-xs uppercase tracking-wider mb-1.5">
                  <Calendar className="h-4 w-4" /> Future Possibilities & Prognosis Timeline
                </p>
                <div className="text-foreground leading-relaxed text-xs space-y-1.5">
                  <p><strong>Timeline:</strong> If treated promptly within 24-48 hours, active fungal/bacterial spread arrests by Day 3 to 5. New shoots push disease-free foliage by Day 7 to 14.</p>
                  <p className="text-muted-foreground"><strong>Untreated Risk:</strong> Delaying treatment during humid conditions leads to rapid secondary infection, severe canopy defoliation, and fruit/tuber rot.</p>
                </div>
              </div>

              {selected.safety_information && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 text-xs uppercase tracking-wider mb-1">
                    <ShieldAlert className="h-4 w-4" /> Safety Instructions & PHI Restrictions
                  </p>
                  <p className="text-foreground leading-relaxed text-xs">
                    {selected.safety_information}
                  </p>
                </div>
              )}

              {selected.reference && (
                <div className="pt-2 text-xs text-muted-foreground border-t border-border/60 flex items-center justify-between">
                  <span>Source Reference: <strong>{selected.reference}</strong></span>
                  {selected.last_updated && <span>Revision: {selected.last_updated}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}