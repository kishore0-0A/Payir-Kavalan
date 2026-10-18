import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function LanguageSelector({ className, compact = false }) {
  const { lang, setLang, languages } = useLanguage();

  const supported = (languages || []).filter((l) => ['en', 'ta', 'hi'].includes(l.code));
  const currentLang = supported.some((l) => l.code === lang) ? lang : 'en';

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <div className={cn(
        'group flex items-center gap-1.5 rounded-xl border border-input/60 bg-background/80 px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/50 hover:bg-muted/50 focus-within:ring-2 focus-within:ring-primary/20',
        compact ? 'h-9 px-2 text-[12px]' : 'h-10 px-3'
      )}>
        <Globe className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:rotate-12" />
        <select
          id="language-select"
          aria-label="Select Language"
          value={currentLang}
          onChange={(e) => setLang(e.target.value)}
          className="cursor-pointer bg-transparent pr-1 text-xs font-semibold text-foreground outline-none focus:outline-none"
        >
          {supported.map((item) => (
            <option key={item.code} value={item.code} className="bg-background text-foreground py-1">
              {compact ? item.native : `${item.native} (${item.label})`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}