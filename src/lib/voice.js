import { useLanguage } from '@/lib/i18n';

// Browser text-to-speech helper. Falls back gracefully when unsupported.
export function useVoice() {
  const { languages, lang } = useLanguage();

  const speak = (text) => {
    if (!text) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const langInfo = languages.find((l) => l.code === lang);
    utter.lang = langInfo?.voice || 'en-US';
    utter.rate = 0.95;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  };

  const stop = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const supported = typeof window !== 'undefined' && !!window.speechSynthesis;
  return { speak, stop, supported };
}