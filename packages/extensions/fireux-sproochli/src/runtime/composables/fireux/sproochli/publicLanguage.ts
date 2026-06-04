type SproochliChromeLanguage =
  | 'de'
  | 'en'
  | 'it'
  | 'fr'
  | 'ar'
  | 'es'
  | 'pt'
  | 'he'
  | 'ko'
  | 'ja'
  | 'bo'

export type SproochliLanguageCode = '' | SproochliChromeLanguage

export type SproochliLanguageOption = {
  code: SproochliLanguageCode
  label: string
  name: string
  source?: 'original' | 'attached' | 'cache' | 'public'
}

export type SproochliLanguageState = {
  primaryLanguage: SproochliChromeLanguage | ''
  defaultLanguage: SproochliChromeLanguage | ''
  attachedLanguages: SproochliChromeLanguage[]
  cachedLanguages: SproochliChromeLanguage[]
  selectableLanguages: SproochliLanguageCode[]
  options: SproochliLanguageOption[]
}

const SPROOCHLI_LANGUAGE_LABELS: Record<SproochliChromeLanguage, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷',
  ar: 'العربية',
  es: '🇪🇸',
  pt: '🇵🇹',
  he: 'עברית',
  ko: '🇰🇷',
  ja: '🇯🇵',
  bo: 'བོད་སྐད་',
}

const SPROOCHLI_LANGUAGE_NAMES: Record<SproochliChromeLanguage, string> = {
  de: 'Deutsch',
  en: 'English',
  it: 'Italiano',
  fr: 'Français',
  ar: 'العربية',
  es: 'Español',
  pt: 'Português',
  he: 'עברית',
  ko: '한국어',
  ja: '日本語',
  bo: 'བོད་སྐད་',
}

export const SPROOCHLI_LANGUAGE_OPTIONS: SproochliLanguageOption[] = [
  { code: '', label: 'Original', name: 'Original', source: 'original' },
  { code: 'de', label: SPROOCHLI_LANGUAGE_LABELS.de, name: SPROOCHLI_LANGUAGE_NAMES.de, source: 'public' },
  { code: 'en', label: SPROOCHLI_LANGUAGE_LABELS.en, name: SPROOCHLI_LANGUAGE_NAMES.en, source: 'public' },
  { code: 'it', label: SPROOCHLI_LANGUAGE_LABELS.it, name: SPROOCHLI_LANGUAGE_NAMES.it, source: 'public' },
  { code: 'fr', label: SPROOCHLI_LANGUAGE_LABELS.fr, name: SPROOCHLI_LANGUAGE_NAMES.fr, source: 'public' },
  { code: 'ar', label: SPROOCHLI_LANGUAGE_LABELS.ar, name: SPROOCHLI_LANGUAGE_NAMES.ar, source: 'public' },
  { code: 'es', label: SPROOCHLI_LANGUAGE_LABELS.es, name: SPROOCHLI_LANGUAGE_NAMES.es, source: 'public' },
  { code: 'pt', label: SPROOCHLI_LANGUAGE_LABELS.pt, name: SPROOCHLI_LANGUAGE_NAMES.pt, source: 'public' },
  { code: 'he', label: SPROOCHLI_LANGUAGE_LABELS.he, name: SPROOCHLI_LANGUAGE_NAMES.he, source: 'public' },
  { code: 'ko', label: SPROOCHLI_LANGUAGE_LABELS.ko, name: SPROOCHLI_LANGUAGE_NAMES.ko, source: 'public' },
  { code: 'ja', label: SPROOCHLI_LANGUAGE_LABELS.ja, name: SPROOCHLI_LANGUAGE_NAMES.ja, source: 'public' },
  { code: 'bo', label: SPROOCHLI_LANGUAGE_LABELS.bo, name: SPROOCHLI_LANGUAGE_NAMES.bo, source: 'public' },
]

export function normalizeSproochliLanguage(
  value: unknown
): SproochliLanguageCode {
  const language = String(value ?? '').trim().replace(/_/g, '-').toLowerCase()
  return language === 'de' ||
    language === 'en' ||
    language === 'it' ||
    language === 'fr' ||
    language === 'ar' ||
    language === 'es' ||
    language === 'pt' ||
    language === 'he' ||
    language === 'ko' ||
    language === 'ja' ||
    language === 'bo'
    ? language
    : ''
}

function normalizeSproochliText(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function resolveTranslationRecordText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return normalizeSproochliText(value)
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''

  const record = value as Record<string, unknown>
  return (
    normalizeSproochliText(record.text) ||
    normalizeSproochliText(record.value) ||
    normalizeSproochliText(record.label) ||
    normalizeSproochliText(record.name) ||
    normalizeSproochliText(record.description)
  )
}

export function resolveSproochliTranslatedText(input: {
  defaultText?: unknown
  translations?: unknown
  selectedLanguage?: unknown
  cacheText?: unknown
}): { text: string; source: 'cache' | 'translation' | 'default' | 'missing' } {
  const cacheText = normalizeSproochliText(input.cacheText)
  if (cacheText) return { text: cacheText, source: 'cache' }

  const language = normalizeSproochliLanguage(input.selectedLanguage)
  const translations =
    input.translations && typeof input.translations === 'object' && !Array.isArray(input.translations)
      ? (input.translations as Record<string, unknown>)
      : null

  if (language && translations) {
    const translatedText = resolveTranslationRecordText(translations[language])
    if (translatedText) return { text: translatedText, source: 'translation' }
  }

  const defaultText = normalizeSproochliText(input.defaultText)
  return defaultText
    ? { text: defaultText, source: 'default' }
    : { text: '', source: 'missing' }
}

export function isSproochliRtlLanguage(value: unknown): boolean {
  const language = normalizeSproochliLanguage(value)
  return language === 'ar' || language === 'he'
}

export function resolveSproochliLanguageOptions(
  enabled: unknown
): SproochliLanguageOption[] {
  return enabled === true
    ? SPROOCHLI_LANGUAGE_OPTIONS
    : [{ code: '', label: 'Original', name: 'Original', source: 'original' }]
}

export function resolveSproochliLanguageState(input: {
  enabled?: unknown
} = {}): SproochliLanguageState {
  const options = resolveSproochliLanguageOptions(input.enabled)

  return {
    primaryLanguage: '',
    defaultLanguage: '',
    attachedLanguages: [],
    cachedLanguages: [],
    selectableLanguages: options.map((option) => option.code),
    options,
  }
}
