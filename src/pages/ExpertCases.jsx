import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, Search, Filter, ArrowRight, Clock, AlertTriangle, 
  CheckCircle2, ChevronDown, Sparkles, MapPin, Calendar, Tag, MessageCircle, Phone, User
} from 'lucide-react';
import base44 from '@/api/apiClient';
import EmptyState from '@/components/EmptyState';
import { cn } from '@/lib/utils';

export default function ExpertCases() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    base44.entities.ExpertReview.list('-created_date', 200)
      .then((r) => { 
        setReviews(r || []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => reviews.filter((r) => {
    if (status && r.status !== status) return false;
    if (severityFilter && r.ai_severity !== severityFilter) return false;
    if (search) { 
      const q = search.toLowerCase(); 
      const crop = (r.crop_name || '').toLowerCase();
      const disease = (r.ai_prediction || '').toLowerCase();
      const loc = (r.location || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      return crop.includes(q) || disease.includes(q) || loc.includes(q) || desc.includes(q);
    }
    return true;
  }), [reviews, search, status, severityFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Pathology Case Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">
            Farmer Case Requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, filter, and inspect incoming crop health submissions requiring human confirmation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Total Cases: <strong className="text-foreground">{reviews.length}</strong>
          </span>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="grid gap-3 sm:grid-cols-12 rounded-2xl border border-border/80 bg-card/60 p-3 shadow-soft backdrop-blur-md">
        <div className="relative sm:col-span-6">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by crop, disease, location, or notes..." 
            className="w-full rounded-xl border border-input/80 bg-background/80 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70" 
          />
        </div>

        <div className="sm:col-span-3">
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="w-full rounded-xl border border-input/80 bg-background/80 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          >
            <option value="">All Review Statuses</option>
            <option value="pending">⏳ Pending Review</option>
            <option value="under_review">🔬 Under Review</option>
            <option value="reviewed">✅ Verified & Completed</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)} 
            className="w-full rounded-xl border border-input/80 bg-background/80 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          >
            <option value="">All Severity Levels</option>
            <option value="severe">🔴 Severe (Urgent action)</option>
            <option value="moderate">🟠 Moderate (Spreading)</option>
            <option value="mild">🟢 Mild (Early warning)</option>
          </select>
        </div>
      </div>

      {/* Case Table / Card Grid */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          icon={Stethoscope} 
          title="No matching cases found" 
          description="Try broadening your search keywords or resetting your status filters." 
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/80 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-4 px-5">Crop & Specimen</th>
                  <th className="py-4 px-5">AI Preliminary Diagnosis</th>
                  <th className="py-4 px-5">Severity</th>
                  <th className="py-4 px-5">Location</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((r) => {
                  const isReviewed = r.status === 'reviewed';
                  const isUnderReview = r.status === 'under_review';
                  const isSevere = r.ai_severity === 'severe';

                  return (
                    <tr key={r.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-5">
                        <Link to={`/expert/cases/${r.id}`} className="flex items-center gap-3.5">
                          {r.image_url ? (
                            <img 
                              src={r.image_url} 
                              alt={r.crop_name} 
                              className="h-12 w-12 rounded-xl object-cover border border-border/80 shadow-sm shrink-0 group-hover:scale-105 transition-transform" 
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                              <Stethoscope className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                              {r.crop_name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              {new Date(r.created_date).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="py-4 px-5">
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {r.ai_prediction || 'Pending inference'}
                          </p>
                          {r.ai_confidence && (
                            <p className="text-xs text-muted-foreground">
                              Confidence: {Math.round(r.ai_confidence * 100)}%
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                          isSevere 
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" 
                            : r.ai_severity === 'moderate'
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        )}>
                          {r.ai_severity || 'Normal'}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-muted-foreground text-xs">
                        {r.location ? (
                          <span className="flex items-center gap-1 text-foreground/80 font-medium">
                            <MapPin className="h-3.5 w-3.5 text-primary" /> {r.location}
                          </span>
                        ) : '—'}
                      </td>

                      <td className="py-4 px-5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                          isReviewed 
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                            : isUnderReview 
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" 
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        )}>
                          {r.status ? r.status.replace('_', ' ') : 'pending'}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/expert/cases/${r.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                            title="Direct Message & Call Farmer"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Contact</span>
                          </Link>
                          <Link
                            to={`/expert/cases/${r.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                          >
                            <span>Review</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}