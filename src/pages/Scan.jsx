import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Check, AlertTriangle,
  ArrowRight, ArrowLeft, X, Loader2, Sparkles, Camera, SwitchCamera
} from 'lucide-react';
import base44 from '@/api/apiClient';
import { SUPPORTED_CROPS } from '@/lib/cropData';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n';

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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

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

  // Live Camera states and refs
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [capturedViaCamera, setCapturedViaCamera] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera media stream and release tracks
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (err) {
        console.error('Error stopping camera stream tracks:', err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  }, []);

  // Cleanup camera streams and object URLs on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [stopCameraStream, previewUrl]);

  // Check if device has multiple camera options (e.g. front & back)
  const checkCameraDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      if (videoInputs.length > 1) {
        setHasMultipleCameras(true);
      }
    } catch {
      // ignore device query failure
    }
  }, []);

  // Callback ref to reliably attach stream to <video> element once mounted
  const attachVideoRef = useCallback((node) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch((err) => console.log('Error auto-playing video stream:', err));
    }
  }, []);

  // Request camera permission and start live preview
  const startCamera = async (targetFacingMode = facingMode) => {
    setCameraError(null);
    setCameraLoading(true);

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.log('Error stopping previous stream:', e);
      }
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser or environment.');
      setCameraLoading(false);
      return;
    }

    try {
      let stream;
      try {
        const constraints = {
          video: {
            facingMode: { ideal: targetFacingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintErr) {
        console.warn('Resolution constraint not met, falling back to basic camera config:', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: targetFacingMode } },
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsCameraActive(true);
      setCameraLoading(false);
      checkCameraDevices();

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.log('Video play error:', e));
      }
    } catch (err) {
      console.error('Camera access error:', err);
      stopCameraStream();
      let errorMsg = 'Could not access camera. Please check camera permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera found on your device. Please use gallery upload.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is already in use by another application.';
      } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        errorMsg = 'Camera requires a secure HTTPS connection or localhost.';
      }
      setCameraError(errorMsg);
    }
  };

  // Toggle front/rear camera
  const switchCamera = () => {
    const nextFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacingMode);
    startCamera(nextFacingMode);
  };

  // Capture current video frame and pipe into analysis workflow
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Failed to capture image frame from camera.');
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const capturedFile = new File([blob], `crop_scan_${timestamp}.jpg`, { type: 'image/jpeg' });

      setCapturedViaCamera(true);
      stopCameraStream();
      setFile(capturedFile);
      setPreviewUrl(URL.createObjectURL(capturedFile));
      setImageUrl(null);
      setQuality(null);
      setStep(2);
    }, 'image/jpeg', 0.95);
  };

  useEffect(() => {
    if (location.state?.cropName) {
      const c = SUPPORTED_CROPS.find((x) => x.name === location.state.cropName);
      if (c) { setCrop(c); setStep(1); }
    }
  }, [location.state]);

  const STEPS = [t('scan.step1', 'Scan Leaf'), t('scan.step2', 'Quality Check'), t('scan.step3', 'AI Analysis')];

  const pickFile = async (f) => {
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(f.type)) {
      toast({ title: 'Unsupported format', description: 'Please use JPG or PNG.', variant: 'destructive' });
      return;
    }
    stopCameraStream();
    setCapturedViaCamera(false);
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
    stopCameraStream();
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setImageUrl(null);
    setQuality(null);
    setCapturedViaCamera(false);
    setStep(1);
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
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('scan.activeCrop', 'Active Crop')}:</span>
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

            {/* LIVE CAMERA VIEWFINDER */}
            {isCameraActive ? (
              <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-black shadow-card">
                {/* Live Video Feed with framing */}
                <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden bg-black flex items-center justify-center">
                  <video
                    ref={attachVideoRef}
                    playsInline
                    autoPlay
                    muted
                    className={cn(
                      "h-full w-full object-cover",
                      facingMode === 'user' && "scale-x-[-1]"
                    )}
                  />

                  {/* Viewfinder Target Framing Brackets */}
                  <div className="pointer-events-none absolute inset-6 sm:inset-10 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="h-8 w-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                      <div className="h-8 w-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                    </div>

                    {/* Subtle Scanning Beam Guide */}
                    <div className="relative w-full h-0.5 bg-emerald-400/80 shadow-[0_0_12px_2px_rgba(52,211,153,0.8)] animate-pulse" />

                    <div className="flex justify-between">
                      <div className="h-8 w-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                      <div className="h-8 w-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
                    </div>
                  </div>

                  {/* Top Bar Status / Flip Camera */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/10">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      {t('scan.alignLeaf', 'Align leaf inside the frame')}
                    </span>

                    {/* Switch Camera Button (Rear / Front) */}
                    <button
                      type="button"
                      onClick={switchCamera}
                      aria-label="Switch camera"
                      title="Switch camera"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition"
                    >
                      <SwitchCamera className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Viewfinder Bottom Controls Bar */}
                <div className="p-4 bg-background/95 backdrop-blur-sm border-t border-border flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  >
                    <X className="h-4 w-4" /> {t('scan.cancel', 'Cancel')}
                  </button>

                  {/* Big Circular Capture Photo Button */}
                  <button
                    type="button"
                    onClick={capturePhoto}
                    aria-label="Capture Photo"
                    className="group relative flex items-center justify-center"
                  >
                    <span className="absolute -inset-1 rounded-full bg-primary/30 animate-pulse group-hover:scale-110 transition-transform" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift group-hover:bg-primary/90 group-active:scale-95 transition-all">
                      <Camera className="h-6 w-6" />
                    </div>
                  </button>

                  <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
                    {t('scan.tapToCapture', 'Tap circle to capture')}
                  </span>
                </div>
              </div>
            ) : (
              <>
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
                  <p className="font-bold text-base text-foreground">{t('scan.dragDrop', 'Drag and drop your leaf photo here')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('scan.supportsFormat', 'Supports high-resolution JPG or PNG')}</p>
                  
                  <div className="mt-5 flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary/90 transition"
                    >
                      <Upload className="h-4 w-4" /> {t('scan.uploadGallery', 'Upload from Gallery')}
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => pickFile(e.target.files[0])} />
                </div>

                {/* Camera Permission / Access Notice if any */}
                {cameraError && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Camera Notice</p>
                      <p className="mt-0.5 text-muted-foreground">{cameraError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCameraError(null)}
                      className="text-muted-foreground hover:text-foreground text-xs p-1"
                      aria-label="Dismiss error"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Scan with Camera Card Directly Below Gallery Upload Area */}
                <div
                  onClick={() => startCamera()}
                  role="button"
                  tabIndex={0}
                  aria-label="Scan with Camera"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      startCamera();
                    }
                  }}
                  className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.08] via-background to-primary/[0.03] p-5 shadow-sm hover:shadow-md hover:border-primary/45 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-center sm:text-left w-full sm:w-auto">
                      <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lift group-hover:scale-105 transition-transform duration-200">
                        <Camera className="h-6 w-6 animate-pulse" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {t('scan.scanWithCamera', 'Scan with Camera')}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-primary/15 text-primary border border-primary/20">
                            {t('scan.live', 'Live')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t('scan.scanWithCameraDesc', 'Take a live photo of your crop to detect possible diseases.')}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera();
                      }}
                      disabled={cameraLoading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:bg-primary/90 transition shrink-0"
                    >
                      {cameraLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Starting...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" /> Start Camera
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

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
              <div className="flex flex-wrap gap-2">
                {capturedViaCamera && (
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      startCamera();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition"
                  >
                    <Camera className="h-4 w-4" /> Retake Photo
                  </button>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted transition"
                >
                  <Upload className="h-4 w-4" /> Choose Different Image
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { stopCameraStream(); setStep(1); }} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition"><ArrowLeft className="h-4 w-4" /> Back</button>
                <button onClick={uploadAndAnalyze} disabled={!quality} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition shadow-soft">
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