import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Mic, Send, Square, Volume2, X, ExternalLink } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import api from '@/api/apiClient';
import { useLanguage } from '@/lib/i18n';

const LANGUAGES = {
  en: { name: 'English', speech: 'en-IN', prompt: 'Ask me about CropCare AI or say “open crop scan”…', listening: 'Listening… speak naturally', speak: 'Speak', stop: 'Stop', permission: 'Allow microphone access in your browser to speak with me.', unsupported: 'Voice recognition is unavailable here. Please use Chrome or Edge, or type your request.' },
  ta: { name: 'தமிழ்', speech: 'ta-IN', prompt: 'CropCare AI பற்றி கேளுங்கள் அல்லது “ஸ்கேன் திற” என்று சொல்லுங்கள்…', listening: 'கேட்கிறேன்… இயல்பாகப் பேசுங்கள்', speak: 'பேசுங்கள்', stop: 'நிறுத்து', permission: 'என்னுடன் பேச உலாவியில் மைக்ரோஃபோன் அனுமதியை வழங்கவும்.', unsupported: 'இந்த உலாவியில் குரல் அறிதல் இல்லை. Chrome அல்லது Edge பயன்படுத்தவும் அல்லது தட்டச்சு செய்யவும்.' },
  hi: { name: 'हिन्दी', speech: 'hi-IN', prompt: 'CropCare AI के बारे में पूछें या “स्कैन खोलो” कहें…', listening: 'सुन रहा हूँ… सामान्य रूप से बोलें', speak: 'बोलें', stop: 'रोकें', permission: 'मुझसे बात करने के लिए ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।', unsupported: 'इस ब्राउज़र में वॉइस रिकग्निशन उपलब्ध नहीं है। Chrome या Edge का उपयोग करें या टाइप करें।' }
};

const PAGES = [
  ['/dashboard', ['dashboard', 'overview', 'டாஷ்போர்டு', 'डैशबोर्ड'], ['dashboard', 'டாஷ்போர்டு', 'डैशबोर्ड']],
  ['/scan', ['scan', 'camera', 'leaf photo', 'photo', 'ஸ்கேன்', 'கேமரா', 'படம்', 'स्कैन', 'कैमरा', 'फोटो'], ['Crop Scan', 'பயிர் ஸ்கேன்', 'फसल स्कैन']],
  ['/my-crops', ['my crops', 'crop list', 'பயிர்கள்', 'என் பயிர்', 'मेरी फसल'], ['My Crops', 'என் பயிர்கள்', 'मेरी फसलें']],
  ['/history', ['history', 'past scan', 'previous scan', 'வரலாறு', 'முந்தைய ஸ்கேன்', 'इतिहास', 'पिछला स्कैन'], ['Diagnosis History', 'நோயறிதல் வரலாறு', 'निदान इतिहास']],
  ['/knowledge', ['knowledge', 'disease library', 'learn', 'அறிவுத்தளம்', 'நோய் தகவல்', 'ज्ञान', 'रोग जानकारी'], ['Knowledge Base', 'அறிவுத்தளம்', 'ज्ञान आधार']],
  ['/alerts', ['alert', 'risk', 'warning', 'weather', 'எச்சரிக்கை', 'ஆபத்து', 'வானிலை', 'अलर्ट', 'चेतावनी', 'मौसम'], ['Alerts', 'எச்சரிக்கைகள்', 'अलर्ट']],
  ['/notifications', ['notification', 'reminder', 'அறிவிப்பு', 'நினைவூட்டல்', 'नोटिफिकेशन', 'रिमाइंडर'], ['Notifications', 'அறிவிப்புகள்', 'सूचनाएँ']],
  ['/experts', ['expert', 'agronomist', 'doctor', 'நிபுணர்', 'வேளாண் அலுவலர்', 'विशेषज्ञ', 'कृषि अधिकारी'], ['Experts', 'நிபுணர்கள்', 'विशेषज्ञ']],
  ['/expert-request', ['request expert', 'submit case', 'நிபுணர் கோரிக்கை', 'நிபுணரிடம் அனுப்பு', 'विशेषज्ञ अनुरोध', 'केस भेजो'], ['Expert Request', 'நிபுணர் கோரிக்கை', 'विशेषज्ञ अनुरोध']],
  ['/profile', ['profile', 'account', 'settings', 'சுயவிவரம்', 'அமைப்புகள்', 'प्रोफाइल', 'सेटिंग'], ['Profile', 'சுயவிவரம்', 'प्रोफाइल']],
  ['/how-it-works', ['how it works', 'how work', 'எப்படி வேலை', 'எப்படி பயன்படுத்த', 'कैसे काम', 'कैसे उपयोग'], ['How it works', 'எப்படி செயல்படுகிறது', 'यह कैसे काम करता है']],
  ['/features', ['feature', 'what can you do', 'வசதி', 'அம்சம்', 'फीチャー'], ['Features', 'அம்சங்கள்', 'सुविधाएँ']],
  ['/contact', ['contact', 'support', 'தொடர்பு', 'சஹாயம்', 'संपर्क', 'सहायता'], ['Contact', 'தொடர்பு', 'संपर्क']],
  ['/login', ['login', 'sign in', 'உள்நுழை', 'लॉगिन'], ['Sign in', 'உள்நுழைவு', 'लॉगिन']]
];

const copy = (lang, en, ta, hi) => {
  const dict = { en, ta, hi };
  return dict[lang] || dict.en || en || '';
};

const matches = (text, terms) => {
  if (!text || !Array.isArray(terms)) return false;
  return terms.some((term) => text.includes(term));
};

function replyTo(question, lang) {
  const safeLang = LANGUAGES[lang] ? lang : 'en';
  const q = (question || '').toLowerCase();
  const page = PAGES.find(([, terms]) => matches(q, terms));
  const moving = matches(q, ['open', 'go', 'take me', 'show', 'திற', 'செல்', 'காட்டு', 'खोल', 'जाओ', 'ले चल']);

  if (page && moving) {
    const titleEn = page[2]?.[0] || 'page';
    const titleTa = page[2]?.[1] || titleEn;
    const titleHi = page[2]?.[2] || titleEn;
    return {
      route: page[0],
      text: copy(safeLang, `Opening ${titleEn}.`, `${titleTa} பக்கத்தைத் திறக்கிறேன்.`, `${titleHi} खोल रहा हूँ।`)
    };
  }

  if (matches(q, ['medicine', 'pesticide', 'spray', 'dose', 'chemical', 'மருந்து', 'பூச்சிக்கொல்லி', 'தெளி', 'அளவு', 'दवा', 'कीटनाशक', 'छिड़काव', 'मात्रा'])) {
    return {
      route: '/experts',
      text: copy(
        safeLang,
        'I can help you assess the next step, but I cannot safely prescribe a pesticide or dose without the confirmed crop, disease, product label, and field conditions. Scan a clear leaf photo first and contact an agricultural expert for serious or uncertain cases.',
        'அடுத்த படியை நான் வழிகாட்ட முடியும். ஆனால் பயிர், நோய், உள்ளூர் மருந்து லேபிள் மற்றும் வயல் நிலை உறுதியில்லாமல் மருந்து அல்லது அளவைச் சொல்வது பாதுகாப்பானது அல்ல. முதலில் தெளிவான இலைப் படத்தை ஸ்கேன் செய்து, தீவிர அல்லது சந்தேகமான நிலையில் நிபுணரை அணுகவும்.',
        'मैं अगला कदम बताने में मदद कर सकता हूँ, लेकिन फसल, रोग, उत्पाद लेबल और खेत की स्थिति तय किए बिना कीटनाशक या मात्रा बताना सुरक्षित नहीं है। पहले साफ पत्ती की फोटो स्कैन करें और गंभीर या अनिश्चित स्थिति में कृषि विशेषज्ञ से संपर्क करें।'
      )
    };
  }

  if (matches(q, ['scan', 'photo', 'upload', 'image', 'ஸ்கேன்', 'படம்', 'பதிவேற்று', 'स्कैन', 'फोटो', 'अपलोड'])) {
    return {
      route: '/scan',
      text: copy(
        safeLang,
        'To scan a crop, take one clear photo of an affected leaf in daylight against a plain background. Keep it in focus and include damaged and healthy tissue if possible. The result is preliminary guidance, not a final diagnosis.',
        'பயிரை ஸ்கேன் செய்ய, பகல் வெளிச்சத்தில் எளிய பின்னணியில் பாதிக்கப்பட்ட இலையின் தெளிவான படத்தை எடுக்கவும். முடிந்தால் ஆரோக்கிய மற்றும் பாதிக்கப்பட்ட பகுதியையும் காட்டவும். முடிவு ஆரம்பநிலை வழிகாட்டல் மட்டுமே.',
        'फसल स्कैन करने के लिए दिन के उजाले में सादे बैकग्राउंड पर प्रभावित पत्ती की साफ फोटो लें। संभव हो तो स्वस्थ और क्षतिग्रस्त हिस्सा दोनों दिखाएँ। परिणाम केवल प्रारंभिक मार्गदर्शन है।'
      )
    };
  }

  if (matches(q, ['weather', 'வானிலை', 'மழை', 'मौसम', 'बारिश'])) {
    return {
      route: '/alerts',
      text: copy(
        safeLang,
        'I do not invent live weather readings. Open Alerts to see the weather and disease-risk information available in your account.',
        'நான் கற்பனையான நேரடி வானிலை அளவீடுகளை கூற மாட்டேன். உங்கள் கணக்கில் உள்ள வானிலை மற்றும் நோய் ஆபத்து தகவலைப் பார்க்க எச்சரிக்கைகள் பக்கத்தைத் திறக்கவும்.',
        'मैं काल्पनिक लाइव मौसम रीडिंग नहीं देता। अपने खाते में उपलब्ध मौसम और रोग-जोखिम जानकारी देखने के लिए अलर्ट खोलें।'
      )
    };
  }

  if (matches(q, ['what is', 'about', 'help', 'how', 'என்ன', 'எப்படி', 'உதவி', 'क्या है', 'कैसे', 'मदद'])) {
    return {
      text: copy(
        safeLang,
        'CropCare AI, also called Payir Kaavalan, helps farmers capture leaf photos for preliminary AI disease assessment, read care guidance, keep scan history, receive risk alerts, and request help from agricultural experts.',
        'பயிர் காவலன் விவசாயிகளுக்கு இலைப் படங்களை வைத்து ஆரம்பநிலை AI நோய் மதிப்பீடு, பராமரிப்பு வழிகாட்டல், ஸ்கேன் வரலாறு, ஆபத்து எச்சரிக்கைகள் மற்றும் வேளாண் நிபுணர் உதவியை வழங்குகிறது.',
        'क्रॉपकेयर एआई, जिसे पयिर कावलन भी कहते हैं, किसानों को पत्ती की फोटो से प्रारंभिक एआई रोग आकलन, देखभाल मार्गदर्शन, स्कैन इतिहास, जोखिम अलर्ट और कृषि विशेषज्ञ सहायता देता है।'
      )
    };
  }

  if (page) {
    const titleEn = page[2]?.[0] || 'page';
    const titleTa = page[2]?.[1] || titleEn;
    const titleHi = page[2]?.[2] || titleEn;
    return {
      text: copy(safeLang, `I can open ${titleEn}. Say “open ${titleEn}”.`, `${titleTa} பக்கத்தைத் திறக்க முடியும். “திற” என்று சொல்லுங்கள்.`, `मैं ${titleHi} खोल सकता हूँ। “खोलो” कहें।`)
    };
  }

  return {
    text: copy(
      safeLang,
      'I am your CropCare friend and guide. Ask how to scan a crop, say “open crop scan,” or ask about history, alerts, the knowledge base, and agricultural experts.',
      'நான் உங்கள் பயிர் காவலன் நண்பன் மற்றும் வழிகாட்டி. பயிரை ஸ்கேன் செய்வது பற்றி கேளுங்கள் அல்லது “ஸ்கேன் திற” என்று சொல்லுங்கள். வரலாறு, எச்சரிக்கைகள், அறிவுத்தளம் மற்றும் நிபுணர்களைப் பற்றியும் கேட்கலாம்.',
      'मैं आपका क्रॉपकेयर मित्र और मार्गदर्शक हूँ। फसल स्कैन के बारे में पूछें या “स्कैन खोलो” कहें। इतिहास, अलर्ट, ज्ञान आधार और कृषि विशेषज्ञों के बारे में भी पूछ सकते हैं।'
    )
  };
}

// Encode raw Float32Array PCM audio into a standard 16-bit Mono WAV Blob
function encodeWAV(samples, sampleRate = 16000) {
  if (!samples || samples.length === 0) return null;
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // 1 channel (mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

export default function CropCareAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang: globalLang, setLang: setGlobalLang } = useLanguage();

  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(() => (globalLang && LANGUAGES[globalLang] ? globalLang : 'en'));
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [heard, setHeard] = useState('');
  const [answer, setAnswer] = useState('');
  const [actionData, setActionData] = useState(null);
  const [input, setInput] = useState('');
  const [voices, setVoices] = useState([]);

  const isMountedRef = useRef(true);
  const recognitionRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isRecordingRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const transcriptRef = useRef('');
  const requestIdRef = useRef(0);
  const historyRef = useRef([]);

  // Sync assistant language with global language when global changes
  useEffect(() => {
    if (globalLang && LANGUAGES[globalLang] && globalLang !== language) {
      setLanguage(globalLang);
    }
  }, [globalLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentLang = LANGUAGES[language] ? language : 'en';
  const ui = LANGUAGES[currentLang] || LANGUAGES.en;

  useEffect(() => {
    isMountedRef.current = true;
    const load = () => {
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const vList = window.speechSynthesis.getVoices();
          if (isMountedRef.current) setVoices(Array.isArray(vList) ? vList : []);
        }
      } catch {
        if (isMountedRef.current) setVoices([]);
      }
    };

    load();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', load);
    }

    return () => {
      isMountedRef.current = false;
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch {}
        try { window.speechSynthesis.removeEventListener('voiceschanged', load); } catch {}
      }
    };
  }, []);

  const cleanupAudio = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch {}
      scriptProcessorRef.current = null;
    }
    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach((track) => {
          try { track.stop(); } catch {}
        });
      } catch {}
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }
      } catch {}
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    isRecordingRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudio();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch {}
      }
    };
  }, [cleanupAudio]);

  const stop = useCallback(() => {
    requestIdRef.current++;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    cleanupAudio();
    if (isMountedRef.current) {
      setListening(false);
      setSpeaking(false);
    }
  }, [cleanupAudio]);

  const say = useCallback((text) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = ui?.speech || 'en-IN';
      const langPrefix = currentLang.toLowerCase();

      const availableVoices = Array.isArray(voices) ? voices : [];
      const matchedVoice = availableVoices.find((v) => {
        const code = (v?.lang || '').toLowerCase().replace('_', '-');
        const name = (v?.name || '').toLowerCase();
        if (langPrefix === 'ta') {
          return code.startsWith('ta') || name.includes('tamil') || name.includes('தமிழ்');
        }
        if (langPrefix === 'hi') {
          return code.startsWith('hi') || name.includes('hindi') || name.includes('हिन्दी');
        }
        return code.startsWith('en-in') || code.startsWith('en');
      }) || null;

      if (matchedVoice) utterance.voice = matchedVoice;
      utterance.rate = 0.95;
      utterance.onstart = () => { if (isMountedRef.current) setSpeaking(true); };
      utterance.onend = () => { if (isMountedRef.current) setSpeaking(false); };
      utterance.onerror = () => { if (isMountedRef.current) setSpeaking(false); };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      if (isMountedRef.current) setSpeaking(false);
    }
  }, [currentLang, ui?.speech, voices]);

  const changeLanguage = useCallback((next) => {
    stop();
    const safeNext = LANGUAGES[next] ? next : 'en';
    setLanguage(safeNext);
    setActionData(null);
    if (setGlobalLang) {
      setGlobalLang(safeNext);
    }
  }, [setGlobalLang, stop]);

  const ask = useCallback(async (question) => {
    if (!question || !question.trim()) return;
    const trimmed = question.trim();
    if (isMountedRef.current) {
      setHeard(trimmed);
      setActionData(null);
    }

    const reqId = ++requestIdRef.current;
    const safeLang = currentLang;

    // 1. Send query to backend assistant engine with conversation history
    try {
      const res = await api.voice.chat(trimmed, safeLang, historyRef.current);
      if (reqId !== requestIdRef.current || !isMountedRef.current) return;
      if (res && res.reply) {
        // Update conversation context
        historyRef.current = [
          ...historyRef.current.slice(-6),
          { role: 'user', content: trimmed },
          { role: 'assistant', content: res.reply }
        ];

        setAnswer(res.reply);
        setActionData(res.action_data || null);
        say(res.reply);

        // Execute actions when requested & verified
        if (res.action === 'change_language' && res.action_data?.language) {
          changeLanguage(res.action_data.language);
        } else if (res.action === 'open_url' && res.action_data?.url) {
          try {
            window.open(res.action_data.url, '_blank', 'noopener,noreferrer');
          } catch (e) {
            console.warn("Popup blocked or failed to auto-open URL:", e);
          }
        } else if (res.route || res.action === 'navigate') {
          const targetRoute = res.route || res.action_data?.route;
          if (targetRoute) {
            setTimeout(() => navigate(targetRoute), 450);
          }
        }
        return;
      }
    } catch (err) {
      console.warn("Backend chat query failed, using local offline guide:", err);
    }

    // 2. Offline fallback to local guide
    const localResult = replyTo(trimmed, safeLang);
    const replyText = localResult?.text || '';
    if (reqId === requestIdRef.current && isMountedRef.current) {
      setAnswer(replyText);
      setActionData(null);
      say(replyText);
      if (localResult?.route) setTimeout(() => navigate(localResult.route), 450);
    }
  }, [changeLanguage, currentLang, navigate, say]);

  // Option B: Backend speech-to-text recording fallback
  const startBackendRecording = useCallback(async () => {
    cleanupAudio();
    audioChunksRef.current = [];
    transcriptRef.current = '';

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia unsupported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      audioStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      isRecordingRef.current = true;
      if (isMountedRef.current) {
        setListening(true);
        setSpeaking(false);
      }

      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        audioChunksRef.current.push(new Float32Array(inputData));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // Automatic stop after 8 seconds of continuous recording
      silenceTimerRef.current = setTimeout(() => {
        if (isRecordingRef.current) {
          finish();
        }
      }, 8000);
    } catch (err) {
      console.error("Microphone recording error:", err);
      cleanupAudio();
      if (isMountedRef.current) {
        setListening(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setAnswer(copy(currentLang, LANGUAGES.en.permission, LANGUAGES.ta.permission, LANGUAGES.hi.permission));
        } else {
          setAnswer(copy(currentLang, 'Voice input is currently unavailable. You can continue using the text assistant.', 'குரல் உள்ளீடு தற்போது கிடைக்கவில்லை. உரை உதவியாளரைத் தொடர்ந்து பயன்படுத்தலாம்.', 'वॉइस इनपुट अभी उपलब्ध नहीं है। आप टेक्स्ट असिस्टेंट का उपयोग जारी रख सकते हैं।'));
        }
      }
    }
  }, [cleanupAudio, currentLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = useCallback(async () => {
    // If native SpeechRecognition was active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      if (isMountedRef.current) setListening(false);
      return;
    }

    // If backend recording was active
    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      if (isMountedRef.current) setListening(false);

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      const chunks = audioChunksRef.current;
      const totalSamples = chunks.reduce((acc, c) => acc + c.length, 0);

      let wavBlob = null;
      if (totalSamples > 3000) {
        const merged = new Float32Array(totalSamples);
        let offset = 0;
        for (const chunk of chunks) {
          merged.set(chunk, offset);
          offset += chunk.length;
        }
        const sampleRate = audioContextRef.current ? audioContextRef.current.sampleRate : 16000;
        wavBlob = encodeWAV(merged, sampleRate);
      }

      cleanupAudio();

      if (!wavBlob) return;

      try {
        const result = await api.voice.transcribe(wavBlob, currentLang);
        if (isMountedRef.current && result && result.transcript && result.transcript.trim()) {
          ask(result.transcript.trim());
        }
      } catch (err) {
        console.error("Backend transcription failed:", err);
        if (isMountedRef.current) {
          setAnswer(copy(currentLang, 'Voice input is currently unavailable. You can continue using the text assistant.', 'குரல் உள்ளீடு தற்போது கிடைக்கவில்லை. உரை உதவியாளரைத் தொடர்ந்து பயன்படுத்தலாம்.', 'वॉइस इनपुट अभी उपलब्ध नहीं है। आप टेक्स्ट असिस्टेंट का उपयोग जारी रख सकते हैं।'));
        }
      }
    }
  }, [ask, cleanupAudio, currentLang]);

  const start = async () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    if (isMountedRef.current) setSpeaking(false);
    cleanupAudio();
    transcriptRef.current = '';

    // Check for native SpeechRecognition (Chrome, Edge, Safari, Opera)
    const SpeechRecognitionClass = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = ui?.speech || 'en-IN';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          if (isMountedRef.current) {
            setListening(true);
            setSpeaking(false);
          }
        };

        recognition.onresult = (event) => {
          if (!event || !event.results) return;
          let finalTranscript = '';
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item && item[0]) {
              if (item.isFinal) {
                finalTranscript += item[0].transcript;
              } else {
                interimTranscript += item[0].transcript;
              }
            }
          }
          const text = finalTranscript || interimTranscript;
          if (text) {
            transcriptRef.current = text;
            if (isMountedRef.current) setHeard(text);
          }
        };

        recognition.onerror = (event) => {
          console.warn("Native SpeechRecognition error:", event?.error);
          if (event?.error === 'not-allowed' || event?.error === 'permission-denied') {
            if (isMountedRef.current) {
              setAnswer(copy(currentLang, LANGUAGES.en.permission, LANGUAGES.ta.permission, LANGUAGES.hi.permission));
              setListening(false);
            }
            cleanupAudio();
          } else if (event?.error === 'no-speech') {
            if (isMountedRef.current) setListening(false);
            cleanupAudio();
          } else {
            console.log("Switching to backend STT fallback due to:", event?.error);
            startBackendRecording();
          }
        };

        recognition.onend = () => {
          if (isMountedRef.current) setListening(false);
          const captured = transcriptRef.current.trim();
          cleanupAudio();
          if (captured && isMountedRef.current) {
            ask(captured);
          }
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn("Failed to start native SpeechRecognition, falling back to backend:", err);
      }
    }

    // Option B: If native speech recognition is unsupported or failed
    await startBackendRecording();
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans">
      {open && (
        <section aria-label="CropCare AI assistant" className="mb-3 w-[min(24rem,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-gradient-to-r from-emerald-700 to-teal-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <h2 className="text-sm font-bold">CropCare AI Guide</h2>
                <p className="text-[10px] text-emerald-100">Farmer’s friend · Tamil · English · Hindi</p>
              </div>
            </div>
            <button aria-label="Close assistant" onClick={() => { stop(); setOpen(false); }}>
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="p-3">
            <div className="mb-3 flex rounded-xl bg-slate-100 p-1">
              {Object.entries(LANGUAGES).map(([code, item]) => (
                <button
                  key={code}
                  onClick={() => changeLanguage(code)}
                  className={cn('flex-1 rounded-lg py-1.5 text-xs font-bold transition', currentLang === code ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <div aria-live="polite" className="min-h-36 rounded-2xl bg-slate-50 p-3 text-sm">
              <p className="mb-2 text-[11px] font-bold text-emerald-700">
                {listening ? ui.listening : `Current page: ${location.pathname}`}
              </p>
              {heard && <p className="mb-2 rounded-lg bg-white p-2 text-slate-600"><b>You:</b> {heard}</p>}
              {answer ? (
                <div className="rounded-lg bg-emerald-50 p-2.5 leading-relaxed text-slate-800">
                  <p className="whitespace-pre-line"><b>Guide:</b> {answer}</p>
                  {actionData?.url && (
                    <div className="mt-2.5 pt-2 border-t border-emerald-200/70 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-emerald-900 truncate">
                        {actionData.target || actionData.destination || 'Open Link'}
                      </span>
                      <a
                        href={actionData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition shrink-0"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">{ui.prompt}</p>
              )}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); ask(input); setInput(''); }} className="mt-3 flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={ui.prompt}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
              <button aria-label="Send" className="rounded-xl bg-emerald-600 p-2.5 text-white disabled:opacity-40" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </button>
            </form>
            <button
              onClick={listening ? finish : speaking ? stop : start}
              className={cn('mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition', listening ? 'bg-rose-600' : speaking ? 'bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-500')}
            >
              {listening ? <Square className="h-4 w-4" /> : speaking ? <Volume2 className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {listening ? ui.stop : speaking ? ui.stop : ui.speak}
            </button>
          </div>
        </section>
      )}
      {!open && (
        <button
          aria-label="Open CropCare AI assistant"
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition hover:scale-105 hover:bg-emerald-500"
        >
          <Bot className="h-7 w-7" />
        </button>
      )}
    </div>
  );
}
