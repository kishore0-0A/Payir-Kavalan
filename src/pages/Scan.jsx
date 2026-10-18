import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ScanLine, Camera, Upload, Image as ImageIcon, Check, AlertTriangle,
  ArrowRight, ArrowLeft, X, Lightbulb, Loader2, Sparkles
} from 'lucide-react';
import base44 from '@/api/apiClient';
import { SUPPORTED_CROPS } from '@/lib/cropData';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const TIPS = [
  'Use natural light', 'Keep the leaf clearly visible', 'Avoid blurry images',
  'Avoid heavy shadows', 'Capture the affected area', 'Keep the camera steady',
  'Avoid excessive background objects'
];

const ANALYSIS_STEPS = [
  'Image received', 'Image preprocessing', 'Crop identification',
  'Disease pattern analysis', 'Confidence calculation', 'Preparing guidance'
];

function analyzeImage(file, imgEl) {
  return new Promise((resolve) => {
    // Resolution
    const w = imgEl.naturalWidth, h = imgEl.naturalHeight;
    const resolutionOk = w >= 400 && h >= 400;
    // Brightness via canvas
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 100 / Math.max(w, h));
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    let sum = 0, count = 0;
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 0; i < data.length; i += 4) { sum += (data[i] + data[i + 1] + data[i + 2]) / 3; count++; }
    } catch (e) { /* tainted canvas */ }
    const avg = count ? sum / count : 128;
    const brightnessOk = avg > 60 && avg < 230;
    // Simulated checks (clearly demo)
    const blurOk = true; // simulated
    const leafDetected = true; // simulated
    const formatOk = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);

    const passed = [resolutionOk, brightnessOk, blurOk, leafDetected, formatOk].filter(Boolean).length;
    let status = 'GOOD';
    if (passed < 4) status = 'POOR';
    else if (passed < 5) status = 'FAIR';

    resolve({
      status,
      checks: [
        { label: 'Resolution acceptable', ok: resolutionOk, demo: false },
        { label: 'Brightness acceptable', ok: brightnessOk, demo: false },
        { label: 'Image sharpness', ok: blurOk, demo: true },
        { label: 'Leaf detected', ok: leafDetected, demo: true },
        { label: 'Image format supported', ok: formatOk, demo: false }
      ]
    });
  });
}

export default function Scan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Directly initialize crop to Tomato so the farmer enters the scanning screen immediately
  const defaultCrop = SUPPORTED_CROPS.find((x) => x.id === 'tomato') || SUPPORTED_CROPS[0];
  const [step, setStep] = useState(1);
  const [crop, setCrop] = useState(defaultCrop);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [quality, setQuality] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    if (location.state?.cropName) {
      const c = SUPPORTED_CROPS.find((x) => x.name === location.state.cropName);
      if (c) { setCrop(c); setStep(1); }
    }
  }, [location.state]);

  const STEPS = ['Scan Leaf', 'Quality Check', 'AI Analysis'];

  const pickFile = async (f) => {
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(f.type)) {
      toast({ title: 'Unsupported format', description: 'Please use JPG or PNG.', variant: 'destructive' });
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setImageUrl(null);
    setQuality(null);
    setStep(2);
  };

  const runQualityCheck = async () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = previewUrl;
    await img.decode();
    const result = await analyzeImage(file, img);
    setQuality(result);
  };

  useEffect(() => {
    if (step === 2 && previewUrl && !quality) runQualityCheck();
  }, [step, previewUrl]);

  const uploadAndAnalyze = async () => {
    setUploading(true);
    let url = imageUrl;
    try {
      if (!url && file) {
        const res = await base44.integrations.Core.UploadPublicFile({ file });
        url = res.file_url;
        setImageUrl(url);
      }
      setUploading(false);
      setStep(3);
      setAnalyzing(true);
      setAnalysisStep(0);
      // animate steps
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setAnalysisStep(i);
        await new Promise((r) => setTimeout(r, 550));
      }
      const response = await base44.functions.invoke('aiPredict', { crop: crop.name, image_url: url });
      const prediction = response.data || response;
      
      const gradcamFullUrl = prediction.gradcam_url
        ? (prediction.gradcam_url.startsWith('http') ? prediction.gradcam_url : `http://localhost:8000${prediction.gradcam_url}`)
        : null;

      // Save diagnosis to backend SQLite database
      const diag = await base44.entities.Diagnosis.create({
        crop_id: location.state?.cropId || '',
        crop_name: crop.name,
        image_url: url,
        gradcam_url: gradcamFullUrl,
        predicted_disease: prediction.predicted_disease,
        disease: prediction.predicted_disease,
        confidence: prediction.confidence,
        severity: prediction.severity,
        status: 'completed',
        model_version: prediction.model_version,
        explanation: prediction.explanation,
        treatment: prediction.treatment,
        prevention: prediction.prevention,
        safety: prediction.safety,
        top_predictions: prediction.top_predictions,
        quality_checks: prediction.quality,
        is_demo: false
      });
      setAnalyzing(false);
      navigate('/scan/result', { state: { diagnosis: diag } });
    } catch (err) {
      setUploading(false);
      setAnalyzing(false);
      toast({ title: 'AI analysis is temporarily unavailable.', description: err.message || 'Please try again later.', variant: 'destructive' });
    }
  };

  const reset = () => {
    setFile(null); setPreviewUrl(null); setImageUrl(null); setQuality(null); setStep(1);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 text-center fade-up">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Scan Crop Leaf</h1>
        <p className="mt-1 text-muted-foreground">Take a photo or upload an image for immediate AI pathology diagnosis.</p>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          // step 1 maps to index 0, step 2 to index 1, step 3 to index 2
          const currentIdx = step - 1;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold font-mono transition',
                i <= currentIdx ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'
              )}>
                {i < currentIdx ? '✓' : `0${i + 1}`}
              </div>
              <span className={cn('text-xs font-semibold hidden sm:inline', i === currentIdx ? 'text-foreground' : 'text-muted-foreground')}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className={cn('h-0.5 w-6 rounded-full sm:w-10', i < currentIdx ? 'bg-primary' : 'bg-muted')} />}
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-card fade-up-1">
        {/* Step 1: Direct Scanning & Image Capture */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Quick Crop Selector Ribbon */}
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Crop:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {crop?.name || 'Tomato'}
                </span>
              </div>

              {/* Minimal inline crop switcher dropdown */}
              <select
                value={crop?.id || 'tomato'}
                onChange={(e) => {
                  const selected = SUPPORTED_CROPS.find(c => c.id === e.target.value);
                  if (selected) setCrop(selected);
                }}
                className="rounded-xl border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {SUPPORTED_CROPS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Drag & Drop / Upload Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files[0]); }}
              className="rounded-3xl border-2 border-dashed border-primary/30 bg-primary/[0.03] hover:border-primary/60 hover:bg-primary/[0.05] transition p-8 text-center group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <Upload className="h-8 w-8" />
              </div>
              <p className="font-bold text-base text-foreground">Drag and drop your leaf photo here</p>
              <p className="text-xs text-muted-foreground mt-1">Supports high-resolution JPG or PNG</p>
              
              <div className="mt-5 flex justify-center" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary/90 transition"
                >
                  <Upload className="h-4 w-4" /> Upload from Gallery
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => pickFile(e.target.files[0])} />
            </div>

            {/* Quick Tips */}
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/50 text-xs">
              <p className="font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary text-primary-foreground tracking-wider">TIPS</span>
                Best practices for accurate neural scanning:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-muted-foreground">
                {TIPS.slice(0, 4).map((tip) => (
                  <li key={tip} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Image check */}
        {step === 2 && (
          <div>
            <h2 className="mb-1 text-lg font-semibold">Image quality check</h2>
            <p className="mb-4 text-sm text-muted-foreground">We check your image before analysis.</p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative overflow-hidden rounded-2xl border border-border">
                <img src={previewUrl} alt="preview" className="h-40 w-full object-cover sm:w-48" />
                <button onClick={reset} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/60 text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1">
                {!quality ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking image...</div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Image Quality</span>
                      <span className={cn('rounded-full px-3 py-1 text-sm font-bold', quality.status === 'GOOD' ? 'bg-success/15 text-success' : quality.status === 'FAIR' ? 'bg-warning/15 text-warning-foreground' : 'bg-destructive/15 text-destructive')}>{quality.status}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {quality.checks.map((c) => (
                        <li key={c.label} className="flex items-center gap-2 text-sm">
                          {c.ok ? <Check className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-warning-foreground" />}
                          <span className={c.ok ? 'text-foreground' : 'text-warning-foreground'}>{c.label}</span>
                          {c.demo && <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">demo</span>}
                        </li>
                      ))}
                    </ul>
                    {quality.status === 'POOR' && (
                      <p className="mt-3 rounded-lg bg-warning/10 p-3 text-sm text-warning-foreground">Please capture a clearer image for a more reliable assessment.</p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">
                <Upload className="h-4 w-4" /> Choose Different Image
              </button>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back</button>
                <button onClick={uploadAndAnalyze} disabled={!quality} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {quality?.status === 'POOR' ? 'Continue Anyway' : 'Analyze Crop'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: AI Analysis */}
        {step === 3 && (
          <div className="text-center">
            <div className="relative mx-auto mb-6 h-40 w-40">
              {previewUrl && <img src={previewUrl || imageUrl} alt="scanning" className="h-full w-full rounded-2xl object-cover" />}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl border-2 border-primary/70">
                <div className="absolute inset-x-0 h-1 bg-primary animate-scan-line shadow-[0_0_14px_3px_hsl(var(--primary))]" />
              </div>
              <span className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift"><Sparkles className="h-5 w-5 animate-pulse" /></span>
            </div>
            <h2 className="text-xl font-bold">Analyzing your crop…</h2>
            <p className="mt-1 text-sm text-muted-foreground">{uploading ? 'Uploading image…' : 'AI is reviewing visible patterns.'}</p>
            <div className="mx-auto mt-6 max-w-sm space-y-2 text-left">
              {ANALYSIS_STEPS.map((s, i) => (
                <div key={s} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition', i <= analysisStep ? 'bg-primary/5' : 'opacity-40')}>
                  {i < analysisStep ? <Check className="h-4 w-4 text-success" /> : i === analysisStep ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <span className="h-4 w-4" />}
                  <span className={i <= analysisStep ? 'text-foreground' : 'text-muted-foreground'}>{s}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">Demo AI analysis — simulated, not a real model inference.</p>
          </div>
        )}
      </div>
    </div>
  );
}