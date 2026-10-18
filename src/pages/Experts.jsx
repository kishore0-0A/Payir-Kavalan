import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Plus, Clock, CheckCircle2, MessageSquare, Star, ShieldCheck, Zap, X } from 'lucide-react';
import base44 from '@/api/apiClient';
import EmptyState from '@/components/EmptyState';
import { cn } from '@/lib/utils';

const STATUS = {
  pending: { label: 'Pending', cls: 'bg-muted text-muted-foreground', icon: Clock },
  under_review: { label: 'Under Review', cls: 'bg-warning/15 text-warning-foreground', icon: Clock },
  reviewed: { label: 'Reviewed', cls: 'bg-success/15 text-success', icon: CheckCircle2 }
};

export default function Experts() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.ExpertReview.list('-created_date', 50).catch(() => []),
      base44.entities.ExpertProfile.list().catch(() => [])
    ]).then(([r, e]) => {
      setReviews(r || []);
      setExperts(e || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-bg p-8 text-primary-foreground shadow-2xl fade-up">
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-6 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-display mb-3">Expert Agricultural Help</h1>
            <p className="text-primary-foreground/90 text-lg mb-6">
              Connect with certified agronomists and plant pathologists to get a verified second opinion on your AI diagnoses. Fast, reliable, and professional.
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <span className="flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 backdrop-blur-sm shadow-sm">
                <Clock className="w-4 h-4"/> 24h Response Time
              </span>
              <span className="flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 backdrop-blur-sm shadow-sm">
                <CheckCircle2 className="w-4 h-4"/> Certified Experts
              </span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/expert-request')} 
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-base font-bold text-primary shadow-lift transition hover:opacity-90 active:scale-95"
          >
            <Plus className="h-5 w-5" /> Request a Review
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="fade-up-1">
        <h2 className="text-2xl font-bold mb-5 font-display text-foreground">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: Zap, title: "1. AI Assessment", desc: "First, scan your crop to get an instant AI prediction." },
            { icon: MessageSquare, title: "2. Request Review", desc: "If unsure, send the case details to our human experts." },
            { icon: ShieldCheck, title: "3. Get Verified", desc: "Receive confirmed observations and action plans." }
          ].map((step, i) => (
            <div key={i} className="rounded-2xl border border-white/20 glass p-6 shadow-soft hover-pop transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Available Experts */}
      <div className="fade-up-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold font-display text-foreground">Available Experts</h2>
          <span className="text-sm text-primary font-semibold cursor-pointer hover:underline">View all</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {experts.length === 0 && !loading ? (
            <p className="text-muted-foreground text-sm col-span-full">No experts available at the moment.</p>
          ) : (
            experts.map((expert, i) => (
              <div 
                key={expert.id || i} 
                onClick={() => setSelectedExpert(expert)}
                className="flex items-center gap-4 rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop transition-all cursor-pointer"
              >
                <img src={expert.image_url} alt={expert.name} className="h-16 w-16 rounded-full object-cover shadow-md ring-2 ring-primary/20" />
                <div>
                  <h3 className="font-bold text-foreground text-base">{expert.name}</h3>
                  <p className="text-sm text-muted-foreground">{expert.role}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center text-xs font-bold text-warning-foreground bg-warning/10 px-2 py-0.5 rounded-full">
                      <Star className="h-3 w-3 fill-warning-foreground mr-1" /> {expert.rating}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">{expert.cases} reviews</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User's Requests */}
      <div className="fade-up-3">
        <h2 className="mb-5 text-2xl font-bold font-display text-foreground">History of Expert Reviews</h2>
        {loading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        ) : reviews.length === 0 ? (
          <EmptyState 
            icon={ShieldCheck} 
            title="You haven't requested any expert opinions yet." 
            description="If you're unsure about the AI's disease prediction, you can send your crop's photo to our verified human experts to get a second opinion and a personalized treatment plan." 
            action={
              <button onClick={() => navigate('/expert-request')} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-transform active:scale-95">
                <Plus className="h-4 w-4" /> Request a Second Opinion
              </button>
            } 
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => {
              const st = STATUS[r.status] || STATUS.pending;
              const Icon = st.icon;
              return (
                <div key={r.id} className="rounded-2xl border border-white/20 glass p-5 shadow-soft hover-pop transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {r.image_url ? (
                        <img src={r.image_url} alt="" className="h-16 w-16 rounded-xl object-cover shadow-sm ring-1 ring-black/5" />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
                          <Stethoscope className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-lg text-foreground">{r.crop_name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">AI Prediction: <span className="font-medium text-foreground/80">{r.ai_prediction || 'N/A'}</span></p>
                        <p className="text-xs text-muted-foreground mt-1">Submitted on {new Date(r.created_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn('inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold shadow-sm', st.cls)}>
                        <Icon className="h-4 w-4" /> {st.label}
                      </span>
                      <button 
                        onClick={() => navigate(`/chat/${experts[0]?.id || 'expert-1'}`)}
                        className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Message Expert
                      </button>
                    </div>
                  </div>
                  {r.status === 'reviewed' && (r.expert_comments || r.recommendations) && (
                    <div className="mt-5 rounded-xl bg-muted/50 p-4 border border-border/50">
                      {r.expert_comments && (
                        <div className="mb-2">
                          <span className="font-bold text-foreground text-sm flex items-center gap-1.5 mb-1"><MessageSquare className="h-4 w-4"/> Expert Comments</span>
                          <p className="text-muted-foreground text-sm">{r.expert_comments}</p>
                        </div>
                      )}
                      {r.recommendations && (
                        <div>
                          <span className="font-bold text-foreground text-sm flex items-center gap-1.5 mb-1"><ShieldCheck className="h-4 w-4"/> Recommendations</span>
                          <p className="text-muted-foreground text-sm">{r.recommendations}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl relative border border-white/10">
            <button onClick={() => setSelectedExpert(null)} className="absolute right-4 top-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
            <div className="flex flex-col items-center text-center mt-2">
              <img src={selectedExpert.image_url} alt={selectedExpert.name} className="h-24 w-24 rounded-full object-cover shadow-xl border-4 border-primary/20 mb-4" />
              <h3 className="text-2xl font-bold font-display text-foreground">{selectedExpert.name}</h3>
              <p className="text-primary font-bold text-sm tracking-wide mt-1">{selectedExpert.role}</p>
              <div className="flex items-center gap-2 mt-3 mb-4">
                <span className="flex items-center text-xs font-bold text-warning-foreground bg-warning/10 px-3 py-1 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-warning-foreground mr-1.5" /> {selectedExpert.rating} Rating
                </span>
                <span className="text-xs text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">{selectedExpert.cases} cases</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 px-2 leading-relaxed">Connect with this expert to get personalized agricultural guidance and second opinions on your crop diseases.</p>
            </div>
            <div className="mt-8 space-y-3">
              <button 
                onClick={() => {
                  navigate(`/chat/${selectedExpert.id}`);
                  setSelectedExpert(null);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
              >
                <MessageSquare className="h-5 w-5" /> Start Live Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}