import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, CheckCircle2, AlertTriangle, ArrowRight, Stethoscope, 
  Sparkles, ShieldCheck, Filter, ArrowUpRight, Award, Zap, Activity
} from 'lucide-react';
import base44 from '@/api/apiClient';
import { cn } from '@/lib/utils';

export default function ExpertDashboard() {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    Promise.all([
      base44.entities.ExpertReview.list('-created_date', 200).catch(() => []),
      base44.auth.me().catch(() => null)
    ]).then(([r, u]) => {
      setReviews(r || []);
      setUser(u);
      setLoading(false);
    });
  }, []);

  const pending = reviews.filter((r) => r.status === 'pending');
  const underReview = reviews.filter((r) => r.status === 'under_review');
  const reviewed = reviews.filter((r) => r.status === 'reviewed');
  const highSeverity = reviews.filter((r) => r.ai_severity === 'severe');

  const filteredCases = reviews.filter(r => {
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'under_review') return r.status === 'under_review';
    if (activeTab === 'reviewed') return r.status === 'reviewed';
    if (activeTab === 'severe') return r.ai_severity === 'severe';
    return true;
  });

  const cards = [
    { 
      icon: Clock, 
      label: 'Pending Reviews', 
      value: pending.length, 
      sub: 'Awaiting triage',
      gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
    },
    { 
      icon: Activity, 
      label: 'In Progress', 
      value: underReview.length, 
      sub: 'Currently open',
      gradient: 'from-blue-500/15 via-blue-500/5 to-transparent',
      border: 'border-blue-500/30',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' 
    },
    { 
      icon: AlertTriangle, 
      label: 'High Severity', 
      value: highSeverity.length, 
      sub: 'Immediate risk',
      gradient: 'from-rose-500/15 via-rose-500/5 to-transparent',
      border: 'border-rose-500/30',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' 
    },
    { 
      icon: CheckCircle2, 
      label: 'Resolved & Verified', 
      value: reviewed.length, 
      sub: 'Diagnosis published',
      gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-card p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-md">
              <Award className="h-3.5 w-3.5" />
              <span>Agronomic Diagnostic Specialist</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-display text-foreground">
              Welcome back, {user?.full_name ? `${user.full_name}` : 'Specialist'}
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Review AI-detected pathology cases, inspect leaf lesions & Grad-CAM visual anchors, and issue certified treatment prescriptions for regional farmers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/expert/cases"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Stethoscope className="h-4 w-4" />
              Review Queue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div 
              key={c.label} 
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                c.border
              )}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", c.gradient)} />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-foreground">{c.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
                </div>
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl shadow-inner", c.iconBg)}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Sections: Cases & Review Pipeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Clinical Review Pipeline
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Triaged farmer submissions categorized by pathology urgency</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card p-1 shadow-inner text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "rounded-xl px-3 py-1.5 transition",
                activeTab === 'all' ? "bg-primary text-primary-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={cn(
                "rounded-xl px-3 py-1.5 transition",
                activeTab === 'pending' ? "bg-primary text-primary-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Pending ({pending.length})
            </button>
            <button
              onClick={() => setActiveTab('under_review')}
              className={cn(
                "rounded-xl px-3 py-1.5 transition",
                activeTab === 'under_review' ? "bg-primary text-primary-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              In Progress ({underReview.length})
            </button>
            <button
              onClick={() => setActiveTab('severe')}
              className={cn(
                "rounded-xl px-3 py-1.5 transition",
                activeTab === 'severe' ? "bg-destructive text-destructive-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Severe ({highSeverity.length})
            </button>
            <button
              onClick={() => setActiveTab('reviewed')}
              className={cn(
                "rounded-xl px-3 py-1.5 transition",
                activeTab === 'reviewed' ? "bg-primary text-primary-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Verified ({reviewed.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Stethoscope className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">No cases in this queue</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Farmer requests matching this status will automatically appear here for your expert assessment.
            </p>
          </div>
        ) : (
          <div className="grid gap-3.5">
            {filteredCases.slice(0, 10).map((r) => {
              const isReviewed = r.status === 'reviewed';
              const isUnderReview = r.status === 'under_review';
              const isSevere = r.ai_severity === 'severe';

              return (
                <Link
                  key={r.id}
                  to={`/expert/cases/${r.id}`}
                  className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition-all duration-200 hover:border-primary/50 hover:shadow-card hover:translate-x-1"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {r.image_url ? (
                      <div className="relative shrink-0 overflow-hidden rounded-xl border border-border/80">
                        <img 
                          src={r.image_url} 
                          alt={r.crop_name} 
                          className="h-14 w-14 object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                        {isSevere && (
                          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                        )}
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-foreground tracking-tight group-hover:text-primary transition-colors">
                          {r.crop_name}
                        </span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="text-xs font-medium text-foreground/85">
                          {r.ai_prediction || 'Pathology evaluation'}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
                        <span>Submitted {new Date(r.created_date).toLocaleDateString()}</span>
                        {r.ai_confidence && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-foreground/80">
                              AI Confidence: {Math.round(r.ai_confidence * 100)}%
                            </span>
                          </>
                        )}
                        {r.location && (
                          <>
                            <span>•</span>
                            <span>{r.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span 
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                        isReviewed 
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                          : isUnderReview 
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" 
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {r.status ? r.status.replace('_', ' ') : 'pending'}
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}