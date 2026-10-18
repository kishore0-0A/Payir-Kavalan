import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Stethoscope, ShieldCheck, Download, Share2, ScanLine,
  Info, Leaf, ListChecks, ShieldAlert, Volume2, ArrowRight, RefreshCw,
  Sparkles, Layers, Activity, CheckCircle2, Trash2, Pill, Droplets, Clock,
  Calendar, TrendingUp, HelpCircle, CheckSquare, Globe, FileDown, Check, Loader2, X
} from 'lucide-react';
import base44 from '@/api/apiClient';
import ConfidenceMeter from '@/components/ConfidenceMeter';
import SeverityBadge from '@/components/SeverityBadge';
import DemoBadge from '@/components/DemoBadge';
import VoiceButton from '@/components/VoiceButton';
import { useToast } from '@/components/ui/use-toast';
import { getAgronomicPrescription } from '@/lib/agronomicPrescription';
import { getMedicinePhoto } from '@/lib/medicinePhotos';
import { generatePrescriptionPDF, PRESCRIPTION_I18N } from '@/lib/prescriptionPdfGenerator';

export default function DiagnosisDetail({ diagnosis: d }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeImageTab, setActiveImageTab] = useState('original'); // 'original' or 'gradcam'
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [generatingPdf, setGeneratingPdf] = useState(false);

  if (!d) return null;

  const prescription = getAgronomicPrescription(d.predicted_disease || d.disease, d.severity);
  const confidence = d.confidence || 0;
  const lowConfidence = confidence < 0.6;
  const severe = d.severity === 'severe';
  const showExpertCard = lowConfidence || severe;

  // Safe parsing of top_predictions and quality_checks
  const topPredictions = Array.isArray(d.top_predictions)
    ? d.top_predictions
    : (typeof d.top_predictions === 'string' ? (() => { try { return JSON.parse(d.top_predictions); } catch { return []; } })() : []);

  const qualityChecks = typeof d.quality_checks === 'object' && d.quality_checks !== null
    ? d.quality_checks
    : (typeof d.quality_checks === 'string' ? (() => { try { return JSON.parse(d.quality_checks); } catch { return null; } })() : null);

  const hasGradcam = Boolean(d.gradcam_url);

  const medNames = prescription.medicines?.map(m => m.name).join(', ') || d.treatment || '';
  const spokenText = `Possible disease: ${d.predicted_disease || 'unknown'}. Confidence ${Math.round(confidence * 100)} percent. Estimated severity: ${d.severity}. Recommended medicines include: ${medNames}. Immediate action: ${prescription.immediateActions?.[0] || 'Prune affected leaves'}. Prognosis: ${prescription.futurePossibilities?.prognosis || 'Monitor crop recovery'}. Consult an agricultural expert for confirmation.`;

  const promptDownloadPrescription = () => {
    setShowLanguageModal(true);
  };

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
      await generatePrescriptionPDF({
        diagnosis: d,
        prescription,
        lang: selectedLanguage,
        tankSize
      });
      toast({
        title: 'Prescription PDF Downloaded',
        description: `Exported in ${PRESCRIPTION_I18N[selectedLanguage]?.langName || 'English'}`
      });
      setShowLanguageModal(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      toast({
        title: 'PDF Generation Notice',
        description: 'Unable to render canvas PDF, falling back to printer format.',
        variant: 'destructive'
      });
      downloadHtmlFallback();
    } finally {
      setGeneratingPdf(false);
    }
  };

  const downloadHtmlFallback = () => {
    const medHtml = (prescription.medicines || []).map(m => `
      <div style="background:#f8fafc;border-left:4px solid #10b981;padding:10px 14px;margin:8px 0;border-radius:4px">
        <strong>${m.name}</strong> (${m.type})<br/>
        <span style="font-size:12px;color:#475569">Dosage: ${m.dosage} | Spray Timing: ${m.timing} ${m.preHarvestInterval ? `| Pre-Harvest Interval: ${m.preHarvestInterval}` : ''}</span><br/>
        <span style="font-size:12px;color:#64748b;font-style:italic">${m.instructions || ''}</span>
      </div>
    `).join('');

    const immediateHtml = (prescription.immediateActions || []).map((step, idx) => `
      <li style="margin-bottom:6px"><strong>Step ${idx + 1}:</strong> ${step}</li>
    `).join('');

    const preventionHtml = (prescription.preventionStrategy || []).map(step => `
      <li style="margin-bottom:6px">${step}</li>
    `).join('');

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Payir Kaavalan Report</title>
    <style>body{font-family:Inter,Arial,sans-serif;max-width:760px;margin:30px auto;padding:0 24px;color:#1F2933;line-height:1.6}
    h1{color:#1B7F4B;font-size:24px;margin-bottom:4px} .subtitle{color:#64748b;font-size:14px;margin-top:0}
    .label{font-weight:bold;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px} 
    .box{border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:14px 0;background:#ffffff}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .disclaimer{background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:14px;font-size:13px;color:#92400e;margin-bottom:20px}</style></head>
    <body>
    <h1>Payir Kaavalan — Comprehensive Crop Health Prescription</h1>
    <p class="subtitle">AI Precision Pathology & Verified Agronomic Care Plan · Generated ${new Date(d.created_date || Date.now()).toLocaleString()}</p>
    <div class="disclaimer">This report provides preliminary AI-based guidance and certified agronomic management practices. Always verify uncertain or severe cases with a qualified agricultural officer before taking large-scale chemical actions.</div>
    <div class="grid">
      <div class="box"><div class="label">Crop</div><div style="font-size:16px;font-weight:600">${d.crop_name || '—'}</div></div>
      <div class="box"><div class="label">AI Predicted Condition</div><div style="font-size:16px;font-weight:600;color:#1B7F4B">${d.predicted_disease || 'Not determined'}</div></div>
      <div class="box"><div class="label">Model Confidence</div><div style="font-weight:600">${Math.round(confidence * 100)}%</div></div>
      <div class="box"><div class="label">Estimated Severity</div><div style="font-weight:600;text-transform:capitalize">${d.severity}</div></div>
    </div>
    
    <div class="box">
      <div class="label" style="color:#059669">Recommended Medicines & Dosages</div>
      ${medHtml}
    </div>

    <div class="box">
      <div class="label" style="color:#d97706">Immediate Action Plan (Next 24-48 Hours)</div>
      <ol style="padding-left:20px;margin-top:8px;font-size:14px">${immediateHtml}</ol>
    </div>

    <div class="box">
      <div class="label" style="color:#2563eb">Long-Term Prevention Strategy</div>
      <ul style="padding-left:20px;margin-top:8px;font-size:14px">${preventionHtml}</ul>
    </div>

    <div class="box">
      <div class="label" style="color:#0284c7">Future Possibilities & Crop Prognosis Timeline</div>
      <p style="font-size:14px;margin:6px 0"><strong>Overall Outlook:</strong> ${prescription.futurePossibilities?.prognosis || 'Monitor plant recovery.'}</p>
      <p style="font-size:13px;margin:6px 0"><strong>Day 3 to 5 (Post Spray):</strong> ${prescription.futurePossibilities?.day3to5 || 'Lesions cease spreading.'}</p>
      <p style="font-size:13px;margin:6px 0"><strong>Day 7 to 14 (Recovery):</strong> ${prescription.futurePossibilities?.day7to14 || 'New vegetative growth resumes.'}</p>
      ${prescription.futurePossibilities?.warningSign ? `<p style="font-size:13px;margin:6px 0;color:#b91c1c"><strong>Critical Warning Sign:</strong> ${prescription.futurePossibilities.warningSign}</p>` : ''}
    </div>

    <div class="box"><div class="label">Agrochemical & Safety Instructions</div><div style="font-size:13px;color:#64748b">${d.safety || 'Wear nitrile gloves, boots, and face protection. Spray in calm weather.'}</div></div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `payir-kaavalan-prescription-${d.id || 'crop'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const text = `Payir Kaavalan assessment — ${d.crop_name}: possible ${d.predicted_disease} (${Math.round(confidence * 100)}% confidence, ${d.severity}). Preliminary guidance only. Consult an agricultural expert.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Payir Kaavalan assessment', text }); } catch (e) {}
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: 'Copied to clipboard' });
    }
  };

  const formatImgUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const [activeTab, setActiveTab] = useState('prescription'); // 'overview' | 'prescription' | 'prevention' | 'prognosis' | 'gradcam'
  const [tankSize, setTankSize] = useState(15); // 15L backpack pump or custom
  const [checkedActions, setCheckedActions] = useState({});

  const toggleAction = (idx) => {
    setCheckedActions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(checkedActions).filter(Boolean).length;
  const totalActions = prescription.immediateActions?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-background to-card p-4 sm:p-6 rounded-3xl border border-emerald-500/20 shadow-soft">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl font-display text-foreground">
              {d.crop_name} Diagnostic Report
            </h1>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> AI Verified
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Scanned on {new Date(d.created_date || Date.now()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={promptDownloadPrescription}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-xs hover:bg-emerald-500/20 transition"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Download Prescription PDF</span>
          </button>
          <button
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold shadow-xs hover:bg-muted transition"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
          <button
            onClick={() => navigate('/scan')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft hover:bg-primary/90 transition"
          >
            <ScanLine className="h-4 w-4" />
            <span>Scan Another</span>
          </button>
        </div>
      </div>

      {/* Hero Disease Diagnosis Spotlight Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft">
        {/* Scanned Image Preview with Mini-Gradcam preview toggle */}
        <div className="md:col-span-5 relative group">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted aspect-[4/3] sm:aspect-video md:aspect-[4/3] shadow-inner">
            <img
              src={formatImgUrl(activeImageTab === 'gradcam' && hasGradcam ? d.gradcam_url : d.image_url)}
              alt="scanned crop"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {hasGradcam && (
              <div className="absolute top-2.5 right-2.5 flex items-center bg-black/60 backdrop-blur-md rounded-xl p-1 border border-white/20 text-[11px] font-semibold text-white shadow-lg">
                <button
                  onClick={() => setActiveImageTab('original')}
                  className={`px-2.5 py-1 rounded-lg transition ${activeImageTab === 'original' ? 'bg-white text-black font-bold shadow' : 'hover:text-white/80'}`}
                >
                  Photo
                </button>
                <button
                  onClick={() => setActiveImageTab('gradcam')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${activeImageTab === 'gradcam' ? 'bg-primary text-primary-foreground font-bold shadow' : 'hover:text-white/80'}`}
                >
                  <Sparkles className="h-3 w-3" /> Heatmap
                </button>
              </div>
            )}
            {activeImageTab === 'gradcam' && (
              <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-black/75 px-3 py-1.5 text-[11px] text-white backdrop-blur">
                🔴 Warm areas pinpoint tissue abnormalities evaluated by the model.
              </div>
            )}
          </div>
        </div>

        {/* Diagnosis Status & Key Metrics */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Detected Crop Pathology
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
              {d.predicted_disease || 'Healthy Crop'}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {d.explanation || 'AI evaluated foliar patterns, cellular discolorations, and textural anomalies.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border/60">
            <div className="rounded-2xl bg-muted/40 p-3 border border-border/50">
              <p className="text-[11px] font-semibold text-muted-foreground">AI Confidence</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-primary font-mono">
                  {Math.round(confidence * 100)}%
                </span>
                <span className="text-[10px] text-muted-foreground">accuracy</span>
              </div>
            </div>

            <div className="rounded-2xl bg-muted/40 p-3 border border-border/50">
              <p className="text-[11px] font-semibold text-muted-foreground">Visible Severity</p>
              <div className="mt-1">
                <SeverityBadge severity={d.severity} />
              </div>
            </div>

            <div className="rounded-2xl bg-muted/40 p-3 border border-border/50 col-span-2 sm:col-span-1 flex flex-col justify-center">
              <p className="text-[11px] font-semibold text-muted-foreground">Voice Assistant</p>
              <div className="mt-1">
                <VoiceButton text={spokenText} label="Listen" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border text-sm font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('prescription')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-all rounded-t-xl ${
            activeTab === 'prescription'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-500/10'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          <span>Medicines & Remedies</span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
            {prescription.medicines?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('prevention')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-all rounded-t-xl ${
            activeTab === 'prevention'
              ? 'border-amber-600 text-amber-600 bg-amber-500/10'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <span className="flex h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
          <span>Action Plan & Prevention</span>
          {totalActions > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300">
              {completedCount}/{totalActions} done
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('prognosis')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-all rounded-t-xl ${
            activeTab === 'prognosis'
              ? 'border-sky-600 text-sky-600 bg-sky-500/10'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <span className="flex h-2 w-2 rounded-full bg-sky-500 ring-2 ring-sky-500/20" />
          <span>Future Possibilities & Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-all rounded-t-xl ${
            activeTab === 'overview'
              ? 'border-primary text-primary bg-primary/10'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <span className="flex h-2 w-2 rounded-full bg-primary ring-2 ring-primary/20" />
          <span>Neural Diagnostics</span>
        </button>
      </div>

      {/* TAB CONTENT AREAS */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Tab Panel (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* TAB 1: MEDICINES & REMEDIES */}
          {activeTab === 'prescription' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              {/* Interactive Sprayer Dosage Calculator */}
              <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="inline-flex items-center justify-center font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white tracking-wider">DOSAGE</span>
                      Sprayer Tank Dosage Calculator
                    </h3>
                    <p className="text-xs text-muted-foreground">Adjust your spray tank size to calculate required medicine quantity</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl p-1 text-xs">
                    {[10, 15, 20, 100].map(sz => (
                      <button
                        key={sz}
                        onClick={() => setTankSize(sz)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${tankSize === sz ? 'bg-emerald-600 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {sz}L {sz === 15 ? '(Standard)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medicine Cards with Real Product Photos */}
              <div className="grid gap-4">
                {prescription.medicines?.map((med, idx) => {
                  const photoUrl = getMedicinePhoto(med.name);
                  return (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft hover:border-emerald-500/50 hover:shadow-card transition flex flex-col md:flex-row group"
                    >
                      {/* Medicine Real Photo */}
                      <div className="md:w-52 h-48 md:h-auto shrink-0 relative bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 p-3 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-border">
                        <img
                          src={photoUrl}
                          alt={med.name}
                          className="h-full w-full max-h-40 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl text-white font-mono text-[11px] font-bold shadow-sm">
                          Step #{idx + 1}
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-emerald-950/85 backdrop-blur-sm text-emerald-200 text-[10px] px-2 py-0.5 rounded-lg text-center font-medium shadow-sm">
                          Authentic Agricultural Product
                        </div>
                      </div>

                      {/* Medicine Info & Simple Farmer Directions */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-2.5">
                          <div>
                            <h4 className="font-extrabold text-base text-foreground leading-snug">
                              {med.name}
                            </h4>
                            <span className="inline-block mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-3 py-0.5 rounded-full border border-emerald-500/30">
                              {med.type}
                            </span>
                          </div>

                          {med.preHarvestInterval && (
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-xl">
                              ⏳ Wait {med.preHarvestInterval} before harvest
                            </span>
                          )}
                        </div>

                        {/* Farmer Simple Dosage Box */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div className="rounded-2xl bg-emerald-500/10 p-3 border border-emerald-500/20 space-y-1">
                            <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> How Much To Mix (Dosage)
                            </div>
                            <div className="text-foreground font-semibold">
                              {med.dosage}
                            </div>
                            <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-white/60 dark:bg-black/30 p-1.5 rounded-lg">
                              For your {tankSize}L backpack pump: mix approx. {(tankSize * 2.5).toFixed(0)} grams (or {(tankSize * 1.5).toFixed(0)} ml)
                            </div>
                          </div>

                          <div className="rounded-2xl bg-sky-500/10 p-3 border border-sky-500/20 space-y-1">
                            <div className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5 text-xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> When To Spray
                            </div>
                            <div className="text-foreground font-semibold">
                              {med.timing}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Avoid midday sun to prevent chemical burns on leaves.
                            </p>
                          </div>
                        </div>

                        {med.instructions && (
                          <div className="rounded-xl bg-muted/60 p-2.5 text-xs text-foreground flex items-start gap-2 border border-border">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0 font-mono text-[11px] uppercase tracking-wider">Note:</span>
                            <span className="text-muted-foreground">{med.instructions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ACTION PLAN & PREVENTION CHECKLIST */}
          {activeTab === 'prevention' && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Interactive Farmer Immediate Checklist */}
              <div className="rounded-3xl border border-amber-500/30 bg-card p-6 shadow-soft space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="inline-flex items-center justify-center font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-white tracking-wider">PRIORITY</span>
                      Immediate Field Checklist (Next 24 - 48 Hours)
                    </h3>
                    <p className="text-xs text-muted-foreground">Check off each task as you complete it on your plot</p>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    {completedCount} of {totalActions} Done
                  </span>
                </div>

                <div className="space-y-2.5">
                  {prescription.immediateActions?.map((act, idx) => {
                    const isDone = Boolean(checkedActions[idx]);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleAction(idx)}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-muted-foreground line-through'
                            : 'bg-muted/30 border-border hover:bg-muted/60 text-foreground'
                        }`}
                      >
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border mt-0.5 transition font-mono text-[11px] font-bold ${
                          isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-input bg-card text-muted-foreground'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className="text-xs font-medium leading-relaxed">{act}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Long-Term Prevention Protocols */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <span className="inline-flex items-center justify-center font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white tracking-wider">PROTOCOL</span>
                  Long-Term Field Prevention Protocol
                </h3>
                <div className="grid gap-2.5">
                  {prescription.preventionStrategy?.map((prev, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-2xl bg-muted/20 border border-border p-3.5 text-xs text-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 font-mono font-bold text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{prev}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FUTURE POSSIBILITIES & PROGNOSIS TIMELINE */}
          {activeTab === 'prognosis' && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Overall Outlook Badge Card */}
              <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-card to-card p-6 shadow-soft space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  <span className="inline-flex items-center justify-center font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-600 text-white tracking-wider">FORECAST</span> Expected Crop Prognosis
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {prescription.futurePossibilities?.prognosis}
                </h3>
                <p className="text-xs text-muted-foreground">Follow the visual recovery milestones below to track crop health week-by-week.</p>
              </div>

              {/* Visual Timeline Stepper */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-sky-500 before:via-emerald-500 before:to-primary">
                {/* Milestone 1 */}
                <div className="relative space-y-1.5 rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-5 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-white font-bold text-xs shadow-md font-mono">
                    01
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-sky-500" /> Day 1 to 2: Initial Spray & Arrest
                    </h4>
                    <span className="text-[10px] font-mono text-sky-600 bg-sky-500/10 px-2 py-0.5 rounded-full font-bold">STAGE 1</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Chemical or bio-fungicide penetrates leaf surface. Pathogen spore germination halted. Fungal mycelial growth arrested within vascular bundles.
                  </p>
                </div>

                {/* Milestone 2 */}
                <div className="relative space-y-1.5 rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md font-mono">
                    02
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Day 3 to 5: Visible Lesion Inactivation
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">STAGE 2</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {prescription.futurePossibilities?.day3to5}
                  </p>
                </div>

                {/* Milestone 3 */}
                <div className="relative space-y-1.5 rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white font-bold text-xs shadow-md font-mono">
                    03
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" /> Day 7 to 14: Vegetative Recovery
                    </h4>
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold">TARGET</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {prescription.futurePossibilities?.day7to14}
                  </p>
                </div>
              </div>

              {/* Critical Warning Indicator */}
              {prescription.futurePossibilities?.warningSign && (
                <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-5 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-3 shadow-soft">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-600">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Critical Warning Sign to Watch For</h5>
                    <p className="mt-1 text-muted-foreground leading-relaxed">{prescription.futurePossibilities.warningSign}</p>
                    <p className="mt-2 text-[11px] font-semibold text-rose-600">If observed: consult your agronomist or local Krishi Vigyan Kendra immediately.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NEURAL NETWORK & DIAGNOSTIC DETAILS */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Top Candidates Breakdown */}
              {topPredictions.length > 0 && (
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-3">
                  <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <Layers className="h-5 w-5 text-primary" /> Model Confidence Distribution
                  </h3>
                  <p className="text-xs text-muted-foreground">Detailed probability breakdown across evaluated disease classes:</p>
                  <div className="space-y-3 pt-2">
                    {topPredictions.map((pred, i) => (
                      <div key={pred.raw_name || i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                            {pred.class_name}
                          </span>
                          <span className="font-mono font-bold text-primary">
                            {(pred.confidence ? (pred.confidence * 100).toFixed(1) : pred.percentage)}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                            style={{ width: `${Math.min(100, Math.max(2, (pred.confidence ? pred.confidence * 100 : pred.percentage)))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-3xl border border-border bg-card p-5 shadow-soft space-y-1 text-xs">
                  <span className="font-bold text-foreground">Architecture</span>
                  <p className="text-muted-foreground">Payir Kaavalan MobileNetV3-Small Fine-Tuned</p>
                </div>
                <div className="rounded-3xl border border-border bg-card p-5 shadow-soft space-y-1 text-xs">
                  <span className="font-bold text-foreground">Explainability</span>
                  <p className="text-muted-foreground">Grad-CAM Spatial Activation Heatmap</p>
                </div>
              </div>
            </div>
          )}

          {/* Safety Notice Card */}
          <div className="rounded-3xl border border-warning/40 bg-warning/10 p-5 text-xs text-muted-foreground flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-warning-foreground mt-0.5" />
            <div>
              <span className="font-bold text-warning-foreground">Agrochemical & Protective Gear (PPE) Guidelines: </span>
              Always wear protective masks, gloves, and boots. Never spray against prevailing wind direction. Safely rinse and lock away chemical containers.
            </div>
          </div>
        </div>

        {/* Right Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Action Navigator Card */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft space-y-4">
            <h3 className="font-bold text-sm text-foreground">Quick Navigation</h3>
            <div className="grid gap-2">
              <button
                onClick={() => setActiveTab('prescription')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition text-left ${
                  activeTab === 'prescription' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' : 'bg-muted/40 hover:bg-muted text-foreground'
                }`}
              >
                <span className="flex items-center gap-2"><Pill className="h-4 w-4" /> Medicines & Dosage</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('prevention')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition text-left ${
                  activeTab === 'prevention' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30' : 'bg-muted/40 hover:bg-muted text-foreground'
                }`}
              >
                <span className="flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Prevention Checklist</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('prognosis')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition text-left ${
                  activeTab === 'prognosis' ? 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30' : 'bg-muted/40 hover:bg-muted text-foreground'
                }`}
              >
                <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Future Prognosis</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Expert Tele-Consultation Box */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card p-5 shadow-soft space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              <Stethoscope className="h-5 w-5" />
              <span>Need Expert Agronomist Advice?</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If your symptoms look severe or you need a custom spray schedule for your acreage, request a certified human review.
            </p>
            <button
              onClick={() => navigate('/expert-request', { state: { diagnosis: d } })}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-emerald-700 transition"
            >
              <Stethoscope className="h-4 w-4" />
              <span>Ask Agricultural Expert</span>
            </button>
          </div>

          {/* Report Actions */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft space-y-2 text-xs">
            <h4 className="font-bold text-sm text-foreground mb-1">Actions</h4>
            <button
              onClick={promptDownloadPrescription}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 font-bold shadow-soft transition"
            >
              <Download className="h-4 w-4" /> Download Full Prescription (PDF)
            </button>
            <button onClick={() => navigate('/scan')} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary p-2.5 font-semibold hover:bg-primary/20 transition">
              <RefreshCw className="h-4 w-4" /> Scan Another Leaf
            </button>
          </div>

          {/* Disclaimer */}
          <div className="rounded-3xl border border-border bg-muted/30 p-4 text-[11px] text-muted-foreground leading-relaxed">
            <p className="flex items-start gap-1.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              AI-based crop assessments are intended to provide rapid initial diagnostics. Always corroborate severe infestations with qualified agronomic officers before applying restricted chemicals.
            </p>
          </div>
        </div>
      </div>

      {/* MULTILINGUAL PRESCRIPTION DOWNLOAD MODAL */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50 duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-foreground font-display">
                    Select PDF Language
                  </h3>
                  <p className="text-xs text-muted-foreground">Choose your preferred language for the printed prescription</p>
                </div>
              </div>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Language Selection Buttons */}
            <div className="space-y-2.5">
              {[
                { code: 'ta', name: 'தமிழ் (Tamil)', desc: 'தமிழ்நாட்டின் உழவர்களுக்கான விரிவான மருந்து வழிகாட்டுதல்' },
                { code: 'en', name: 'English', desc: 'Standard Agronomic Pathology & Scientific Trade Names' },
                { code: 'hi', name: 'हिंदी (Hindi)', desc: 'भारतीय किसानों के लिए संपूर्ण फसल सुरक्षा एवं डोज़ निर्देश' }
              ].map(item => {
                const isSelected = selectedLanguage === item.code;
                return (
                  <div
                    key={item.code}
                    onClick={() => setSelectedLanguage(item.code)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-foreground ring-2 ring-emerald-500/30'
                        : 'border-border bg-muted/30 hover:bg-muted/70 text-foreground'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.code === 'ta' && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                            Regional
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>

                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-input bg-card'
                    }`}>
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dosage Tank Preview */}
            <div className="rounded-2xl bg-muted/40 p-3 border border-border text-xs flex justify-between items-center text-muted-foreground">
              <span>Spray Tank Size in PDF:</span>
              <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-card px-2.5 py-1 rounded-lg border border-border">
                {tankSize} Litres (Backpack Pump)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setShowLanguageModal(false)}
                disabled={generatingPdf}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePdf}
                disabled={generatingPdf}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold shadow-soft transition disabled:opacity-50"
              >
                {generatingPdf ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Rendering PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}