import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function LanguageSelector({ className, compact = false }) {
  const { lang, setLang, languages } = useLanguage();
  return null;

}