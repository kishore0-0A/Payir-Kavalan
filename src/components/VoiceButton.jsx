import React, { useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { useVoice } from '@/lib/voice';
import { cn } from '@/lib/utils';

export default function VoiceButton({ text, label = 'Read aloud', className, size = 'md' }) {
  const { speak, stop, supported } = useVoice();
  const [speaking, setSpeaking] = useState(false);

  if (!supported) return null;

  const handle = () => {
    if (speaking) {
      stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text);
    // Reset when finished (approximate)
    const approxMs = Math.min(15000, Math.max(2500, text.length * 65));
    setTimeout(() => setSpeaking(false), approxMs);
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base'
  };

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 text-primary font-medium transition hover:bg-primary/10 active:scale-95',
        sizes[size],
        className
      )}
    >
      {speaking ? <Square className="h-4 w-4 fill-current" /> : <Volume2 className="h-4 w-4" />}
      <span>{speaking ? 'Stop' : label}</span>
    </button>
  );
}