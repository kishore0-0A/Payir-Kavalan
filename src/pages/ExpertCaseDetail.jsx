import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, Stethoscope, MessageSquare, CheckCircle2, Pill, MapPin, Calendar, User, Sparkles, Phone, Video, MessageCircle, Send, X, Search, Plus
} from 'lucide-react';
import base44 from '@/api/apiClient';
import SeverityBadge from '@/components/SeverityBadge';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { ALL_MEDICINES_CATALOG } from '@/lib/medicineCatalog';
import { getMedicinePhoto } from '@/lib/medicinePhotos';

export default function ExpertCaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [review, setReview] = useState(null);
  const [form, setForm] = useState({ 
    status: 'under_review', 
    expert_comments: '', 
    recommendations: '' 
  });
  const [saving, setSaving] = useState(false);
  const [activeCallType, setActiveCallType] = useState(null); // 'audio' | 'video' | null
  const [callStatus, setCallStatus] = useState('calling'); // 'calling' | 'connected'
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  
  // Suggest Medicine Modal State
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [suggestedMedicines, setSuggestedMedicines] = useState([]);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Greetings! I am reviewing your crop specimen right now. Could you confirm if the discoloration is on the upper or lower leaves?", sender: 'expert', time: 'Just now' }
  ]);
  const [directMessageText, setDirectMessageText] = useState('');

  useEffect(() => {
    base44.entities.ExpertReview.get(id)
      .then((r) => { 
        setReview(r); 
        setForm({ 
          status: r.status === 'pending' ? 'under_review' : r.status, 
          expert_comments: r.expert_comments || '', 
          recommendations: r.recommendations || '' 
        }); 
      })
      .catch(() => {});
  }, [id]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (form.status === 'reviewed') payload.reviewed_at = new Date().toISOString();
      await base44.entities.ExpertReview.update(id, payload);
      
      if (review?.diagnosis_id && form.status === 'reviewed') {
        await base44.entities.Diagnosis.update(review.diagnosis_id, { status: 'reviewed' }).catch(() => {});
      }
      toast({ title: 'Clinical assessment saved', description: 'The farmer will be notified of your review.' });
      navigate('/expert/cases');
    } catch (err) { 
      toast({ title: 'Could not save review', description: err.message, variant: 'destructive' }); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDirectSend = (e) => {
    e.preventDefault();
    if (!directMessageText.trim()) return;
    const msg = {
      id: Date.now(),
      text: directMessageText.trim(),
      sender: 'expert',
      time: 'Just now'
    };
    setChatMessages(prev => [...prev, msg]);
    setDirectMessageText('');
    toast({ title: 'Message sent to farmer' });
  };

  const startCall = (type) => {
    setActiveCallType(type);
    setCallStatus('calling');
    setTimeout(() => {
      setCallStatus('connected');
    }, 2200);
  };

  const applyPrescriptionTemplate = (type) => {
    if (type === 'fungal') {
      setForm(f => ({
        ...f,
        status: 'reviewed',
        expert_comments: 'Symptoms indicate a fungal leaf spot infestation. The lesion margins show typical concentric necrotic rings confirmed by AI analysis.',
        recommendations: '1. Spray Copper Oxychloride (2.5g/L) or Mancozeb (2g/L) early morning.\n2. Avoid overhead sprinkler irrigation to reduce leaf moisture.\n3. Prune and safely destroy lower infected leaves.'
      }));
    } else if (type === 'bacterial') {
      setForm(f => ({
        ...f,
        status: 'reviewed',
        expert_comments: 'Bacterial blight characteristics visible. Water-soaked lesions progressing to necrotic tissue.',
        recommendations: '1. Apply Streptomycin Sulfate + Tetracycline mixture (1g/10L).\n2. Sterilize farm tools between fields.\n3. Maintain proper field drainage.'
      }));
    } else if (type === 'healthy') {
      setForm(f => ({
        ...f,
        status: 'reviewed',
        expert_comments: 'Vegetative tissue appears healthy with minor environmental stress (nutrient deficiency/sunlight burn) rather than active pathogens.',
        recommendations: '1. Continue balanced NPK fertilization.\n2. Maintain consistent irrigation schedule without chemical fungicides.'
      }));
    }
  };

  const addMedicineToPrescription = (med) => {
    // Check if already added
    if (suggestedMedicines.some(m => m.id === med.id)) {
      toast({ title: 'Already included in suggested medicines' });
      return;
    }

    const updated = [...suggestedMedicines, med];
    setSuggestedMedicines(updated);

    // Format new line to append into the recommendations text area
    const formattedLine = `• Prescribed: ${med.name} (${med.type}) — Dosage: ${med.dosage}. Optimal Timing: ${med.timing}. PHI: ${med.preHarvestInterval}.`;
    
    setForm(f => ({
      ...f,
      status: 'reviewed',
      recommendations: f.recommendations 
        ? `${f.recommendations.trim()}\n${formattedLine}` 
        : formattedLine
    }));

    toast({ 
      title: 'Medicine Prescribed', 
      description: `Added ${med.name} to farmer prescription.` 
    });
  };

  const removeMedicineFromPrescription = (medId) => {
    setSuggestedMedicines(prev => prev.filter(m => m.id !== medId));
  };

  if (!review) {
    return (
      <div className="max-w-5xl mx-auto py-12 space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-3xl bg-muted" />
          <div className="h-96 animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <button 
            onClick={() => navigate('/expert/cases')} 
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Case Queue
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-display">
              Clinical Assessment
            </h1>
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
              Case #{review.id.slice(0, 8)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
            review.status === 'reviewed' 
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          )}>
            {review.status ? review.status.replace('_', ' ') : 'Pending'}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Specimen & Farmer Submission (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Specimen Card */}
          <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-soft">
            <div className="relative aspect-[4/3] w-full bg-black/5">
              {review.image_url ? (
                <img 
                  src={review.image_url} 
                  alt="Crop Specimen" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Stethoscope className="h-10 w-10 opacity-40" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  {review.crop_name}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* AI Inference Box */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> AI Model Diagnosis
                  </span>
                  {review.ai_severity && (
                    <SeverityBadge severity={review.ai_severity} />
                  )}
                </div>
                <p className="text-base font-bold text-foreground">
                  {review.ai_prediction || 'Inconclusive / Unspecified'}
                </p>
                {review.ai_confidence && (
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Confidence Score</span>
                    <strong className="text-foreground">{Math.round(review.ai_confidence * 100)}%</strong>
                  </div>
                )}
              </div>

              {/* Farmer Contact & Direct Communication Card */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-sm">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-foreground">
                        {review.farmer_name || 'Farmer Client'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {review.farmer_mobile || review.farmer_email || 'Registered Grower'}
                      </p>
                    </div>
                  </div>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="Online" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsMessageOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Direct Message</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startCall('audio')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-card px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Voice Call</span>
                  </button>
                </div>
                <div className="flex items-center justify-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => startCall('video')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Video className="h-3 w-3" /> Start Tele-Consult Video Call
                  </button>
                </div>
              </div>

              {/* Farmer Submission Metadata */}
              <div className="space-y-3 pt-1 text-sm">
                <div className="flex items-center justify-between py-1.5 border-b border-border/50 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Submitted Date
                  </span>
                  <span className="font-semibold text-foreground">
                    {new Date(review.created_date).toLocaleString()}
                  </span>
                </div>

                {review.location && (
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Farmer Location
                    </span>
                    <span className="font-semibold text-foreground">{review.location}</span>
                  </div>
                )}

                {review.description && (
                  <div className="pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Farmer Observation
                    </p>
                    <p className="rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
                      "{review.description}"
                    </p>
                  </div>
                )}

                {review.question && (
                  <div className="pt-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Specific Farmer Question
                    </p>
                    <p className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs leading-relaxed text-foreground font-medium">
                      "{review.question}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Expert Prescription & Diagnosis Form (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={save} className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" /> Specialist Prescription & Verification
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirm AI accuracy, provide clinical remarks, and issue action items.
                </p>
              </div>
            </div>

            {/* Quick Prescription Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                One-Click Advisory Templates
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => applyPrescriptionTemplate('fungal')}
                  className="rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary transition-all"
                >
                  🌿 Fungal Blight Protocol
                </button>
                <button
                  type="button"
                  onClick={() => applyPrescriptionTemplate('bacterial')}
                  className="rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary transition-all"
                >
                  🦠 Bacterial Protocol
                </button>
                <button
                  type="button"
                  onClick={() => applyPrescriptionTemplate('healthy')}
                  className="rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary transition-all"
                >
                  ✅ Environmental / Nutrient
                </button>
              </div>
            </div>

            {/* Status Select */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Review Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="under_review">🔬 In Progress (Under Review)</option>
                <option value="reviewed">✅ Verified & Completed</option>
                <option value="pending">⏳ Return to Pending Queue</option>
              </select>
            </div>

            {/* Specialist Observations */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5 text-primary" /> Specialist Pathology Remarks
              </label>
              <textarea
                rows={4}
                required
                value={form.expert_comments}
                onChange={(e) => setForm({ ...form, expert_comments: e.target.value })}
                placeholder="Explain the pathogen biology, confirm or correct the AI diagnosis, and note key visual lesion markers..."
                className="w-full rounded-xl border border-input bg-background p-3.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Recommendations & Treatment Plan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Pill className="h-3.5 w-3.5 text-primary" /> Recommended Prescriptions & Cultural Practices
                </label>
                <button
                  type="button"
                  onClick={() => setIsMedicineModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  <Pill className="h-3.5 w-3.5" />
                  Suggest Medicine
                  <Sparkles className="h-3 w-3" />
                </button>
              </div>

              {/* Selected Prescribed Medicines preview cards */}
              {suggestedMedicines.length > 0 && (
                <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center justify-between text-xs font-bold text-primary">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Prescribed Medicines ({suggestedMedicines.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMedicineModalOpen(true)}
                      className="text-[11px] underline hover:text-primary/80"
                    >
                      + Add More
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {suggestedMedicines.map((med) => {
                      const photo = getMedicinePhoto(med.name);
                      return (
                        <div 
                          key={med.id}
                          className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2 text-xs shadow-xs relative group"
                        >
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted/40 p-1 flex items-center justify-center border border-border/50">
                            <img 
                              src={photo} 
                              alt={med.name} 
                              className="h-full w-full object-contain"
                              onError={(e) => { e.currentTarget.src = '/medicines/copper-oxychloride.png'; }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-foreground truncate">{med.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{med.dosage}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMedicineFromPrescription(med.id)}
                            className="text-muted-foreground hover:text-rose-500 p-1 rounded-md transition"
                            title="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <textarea
                rows={4}
                required
                value={form.recommendations}
                onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                placeholder="List dosage (e.g. Copper Oxychloride 2.5g/L), spray timing, bio-control alternatives, or click 'Suggest Medicine' above..."
                className="w-full rounded-xl border border-input bg-background p-3.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing Clinical Review...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Verified Diagnosis
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Slide-over Direct Messaging Modal */}
      {isMessageOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex h-full w-full max-w-md flex-col bg-card border-l border-border/80 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {review.farmer_name || 'Farmer Client'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Direct Agronomist Line • {review.crop_name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsMessageOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Specimen Context Pill */}
            <div className="border-b border-border/50 bg-primary/5 px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-primary truncate max-w-[200px]">
                Case: {review.crop_name} • {review.ai_prediction || 'Inference'}
              </span>
              <button 
                onClick={() => startCall('audio')}
                className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
              >
                <Phone className="h-3 w-3" /> Call Farmer
              </button>
            </div>

            {/* Message thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-muted/10">
              {chatMessages.map(m => (
                <div 
                  key={m.id} 
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm",
                    m.sender === 'expert'
                      ? "ml-auto bg-primary text-primary-foreground rounded-br-xs"
                      : "mr-auto bg-card border border-border text-foreground rounded-bl-xs"
                  )}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <span className={cn(
                    "text-[10px] mt-1.5 self-end opacity-70",
                    m.sender === 'expert' ? "text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {m.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleDirectSend} className="border-t border-border/80 p-3 bg-card flex items-center gap-2">
              <input
                type="text"
                value={directMessageText}
                onChange={(e) => setDirectMessageText(e.target.value)}
                placeholder="Type real-time advice or question..."
                className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={!directMessageText.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Audio / Video Tele-Consult Call Modal */}
      {activeCallType && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300 p-4">
          <div className="relative flex flex-col items-center justify-between w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/95 p-8 text-white shadow-2xl text-center">
            {/* Header info */}
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                {activeCallType === 'audio' ? <Phone className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                {callStatus === 'calling' ? 'Dialing Farmer...' : 'Connected (00:18)'}
              </span>
              <h3 className="text-xl font-bold tracking-tight mt-3">
                {review.farmer_name || 'Farmer Client'}
              </h3>
              <p className="text-xs text-slate-400">
                {review.farmer_mobile || review.location || 'Regional Farm Connection'}
              </p>
            </div>

            {/* Center Avatar / Video Area */}
            <div className="my-8 relative">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-slate-800 ring-4 ring-slate-700/50 shadow-xl overflow-hidden">
                {review.image_url ? (
                  <img src={review.image_url} alt="crop" className="h-full w-full object-cover opacity-60" />
                ) : (
                  <User className="h-12 w-12 text-slate-400" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <User className="h-10 w-10 text-white" />
                </div>
              </div>

              {callStatus === 'calling' && (
                <div className="absolute -inset-2 rounded-full border-2 border-emerald-400/40 animate-ping" />
              )}
            </div>

            {/* Specimen Context Footer */}
            <div className="rounded-xl bg-slate-800/80 px-4 py-2 text-xs text-slate-300 w-full mb-6">
              <p className="font-semibold text-white truncate">Crop: {review.crop_name}</p>
              <p className="text-[11px] text-slate-400 truncate">AI: {review.ai_prediction || 'Lesion Assessment'}</p>
            </div>

            {/* Call Controls */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveCallType(activeCallType === 'audio' ? 'video' : 'audio')}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                title="Toggle Media"
              >
                {activeCallType === 'audio' ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
              </button>

              <button 
                onClick={() => setActiveCallType(null)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-transform active:scale-95"
                title="End Call"
              >
                <Phone className="h-6 w-6 rotate-[135deg]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Medicine Catalog Modal for Experts */}
      {isMedicineModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-card border border-border/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 p-5 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
                  <Pill className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      Agricultural Medicine Master Catalog
                    </h3>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {ALL_MEDICINES_CATALOG.length} Verified Formulations
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select targeted fungicides, bactericides, bio-control, or micronutrients to prescribe for {review.crop_name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsMedicineModalOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="border-b border-border/50 p-4 bg-background/50 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  placeholder="Search by chemical name, brand (e.g., Mancozeb, Blitox, Ridomil, Amistar, Neem, Trichoderma), or disease..."
                  className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { id: 'ALL', label: 'All Medicines' },
                  { id: 'FUNGICIDE', label: 'Fungicides' },
                  { id: 'BACTERICIDE', label: 'Bactericides' },
                  { id: 'INSECTICIDE', label: 'Insecticides / Miticides' },
                  { id: 'BIO', label: 'Bio-Control / Organics' },
                  { id: 'NUTRIENT', label: 'Plant Tonics / NPK' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 font-semibold transition-all",
                      selectedCategory === tab.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Medicine Cards Grid (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5">
              {(() => {
                const filtered = ALL_MEDICINES_CATALOG.filter((med) => {
                  const query = medicineSearch.toLowerCase();
                  const matchesSearch = 
                    med.name.toLowerCase().includes(query) ||
                    med.type.toLowerCase().includes(query) ||
                    med.category.toLowerCase().includes(query) ||
                    med.recommendedFor.toLowerCase().includes(query) ||
                    med.instructions.toLowerCase().includes(query);

                  if (!matchesSearch) return false;

                  if (selectedCategory === 'FUNGICIDE') return med.type.includes('Fungicide') || med.category.includes('Fungicide');
                  if (selectedCategory === 'BACTERICIDE') return med.type.includes('Bactericide') || med.type.includes('Antibacterial') || med.category.includes('Bactericide');
                  if (selectedCategory === 'INSECTICIDE') return med.type.includes('Insecticide') || med.type.includes('Acaricide') || med.category.includes('Mite') || med.category.includes('Insecticide');
                  if (selectedCategory === 'BIO') return med.type.includes('Biological') || med.type.includes('Organic') || med.type.includes('Botanical');
                  if (selectedCategory === 'NUTRIENT') return med.type.includes('Nutrient') || med.type.includes('Tonic') || med.type.includes('Biostimulant');
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
                        <Search className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-foreground">No medicines matched your criteria</p>
                      <p className="text-xs text-muted-foreground mt-1">Try another search keyword or switch categories</p>
                    </div>
                  );
                }

                return (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((med) => {
                      const photo = getMedicinePhoto(med.name);
                      const isAdded = suggestedMedicines.some(m => m.id === med.id);

                      return (
                        <div
                          key={med.id}
                          className={cn(
                            "flex flex-col justify-between rounded-2xl border p-4 transition-all bg-card shadow-xs hover:border-primary/50 hover:shadow-md",
                            isAdded && "border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/30"
                          )}
                        >
                          <div>
                            {/* Card Top: Real Product Photo + Type Tag */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="h-16 w-16 shrink-0 rounded-xl bg-white dark:bg-slate-900 border border-border/60 p-1.5 flex items-center justify-center shadow-xs">
                                <img
                                  src={photo}
                                  alt={med.name}
                                  className="h-full w-full object-contain"
                                  onError={(e) => { e.currentTarget.src = '/medicines/copper-oxychloride.png'; }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 truncate max-w-full">
                                  {med.category}
                                </span>
                                <h4 className="font-bold text-xs text-foreground leading-snug line-clamp-2">
                                  {med.name}
                                </h4>
                              </div>
                            </div>

                            {/* Key Prescribing Details */}
                            <div className="space-y-1.5 text-[11px] bg-muted/30 rounded-xl p-2.5 mb-3 border border-border/40">
                              <p className="text-foreground">
                                <span className="font-bold text-muted-foreground">Dosage: </span>
                                <span className="font-semibold">{med.dosage}</span>
                              </p>
                              <p className="text-foreground">
                                <span className="font-bold text-muted-foreground">Timing: </span>
                                {med.timing}
                              </p>
                              <p className="text-foreground">
                                <span className="font-bold text-muted-foreground">Targets: </span>
                                <span className="text-primary font-medium">{med.recommendedFor}</span>
                              </p>
                              <p className="text-[10px] text-muted-foreground italic">
                                PHI: {med.preHarvestInterval}
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isAdded) {
                                removeMedicineFromPrescription(med.id);
                              } else {
                                addMedicineToPrescription(med);
                              }
                            }}
                            className={cn(
                              "inline-flex items-center justify-center gap-1.5 w-full rounded-xl py-2 px-3 text-xs font-bold transition-all",
                              isAdded
                                ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20"
                                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                            )}
                          >
                            {isAdded ? (
                              <>
                                <X className="h-3.5 w-3.5" />
                                Remove from Prescription
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                Suggest This Medicine
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border/60 p-4 bg-muted/20">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{suggestedMedicines.length}</span> medicine(s) selected for current prescription
              </p>
              <button
                type="button"
                onClick={() => setIsMedicineModalOpen(false)}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-sm transition"
              >
                Done Prescribing ({suggestedMedicines.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}