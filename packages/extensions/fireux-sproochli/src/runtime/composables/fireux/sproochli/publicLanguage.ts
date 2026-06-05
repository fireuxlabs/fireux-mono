type SproochliChromeLanguage =
  | 'ar'
  | 'bo'
  | 'cs'
  | 'da'
  | 'de'
  | 'en'
  | 'el'
  | 'es'
  | 'fa'
  | 'fi'
  | 'fr'
  | 'he'
  | 'hi'
  | 'hu'
  | 'id'
  | 'it'
  | 'ko'
  | 'ja'
  | 'nl'
  | 'no'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'sv'
  | 'th'
  | 'tr'
  | 'uk'
  | 'ur'
  | 'vi'
  | 'zh'

export type SproochliLanguageCode = '' | SproochliChromeLanguage

export type SproochliLanguageOption = {
  code: SproochliLanguageCode
  label: string
  name: string
  source?: 'original' | 'attached' | 'cache' | 'public' | 'on_demand'
}

export type SproochliLanguageState = {
  primaryLanguage: SproochliChromeLanguage | ''
  defaultLanguage: SproochliChromeLanguage | ''
  attachedLanguages: SproochliChromeLanguage[]
  cachedLanguages: SproochliChromeLanguage[]
  selectableLanguages: SproochliLanguageCode[]
  options: SproochliLanguageOption[]
}

export type SproochliLanguageOptionsInput = {
  enabled?: unknown
  defaultLanguage?: unknown
  attachedLanguages?: unknown
  cachedLanguages?: unknown
  publicLanguages?: unknown
  onDemandLanguages?: unknown
}

const SPROOCHLI_LANGUAGE_LABELS: Record<SproochliChromeLanguage, string> = {
  ar: '🇸🇦',
  bo: 'bo',
  cs: '🇨🇿',
  da: '🇩🇰',
  de: '🇩🇪',
  en: '🇬🇧',
  el: '🇬🇷',
  es: '🇪🇸',
  fa: '🇮🇷',
  fi: '🇫🇮',
  fr: '🇫🇷',
  he: '🇮🇱',
  hi: '🇮🇳',
  hu: '🇭🇺',
  id: '🇮🇩',
  it: '🇮🇹',
  ko: '🇰🇷',
  ja: '🇯🇵',
  nl: '🇳🇱',
  no: '🇳🇴',
  pl: '🇵🇱',
  pt: '🇵🇹',
  ro: '🇷🇴',
  ru: '🇷🇺',
  sv: '🇸🇪',
  th: '🇹🇭',
  tr: '🇹🇷',
  uk: '🇺🇦',
  ur: '🇵🇰',
  vi: '🇻🇳',
  zh: '🇨🇳',
}

const SPROOCHLI_LANGUAGE_NAMES: Record<SproochliChromeLanguage, string> = {
  ar: 'العربية',
  bo: 'བོད་སྐད་',
  cs: 'Čeština',
  da: 'Dansk',
  de: 'Deutsch',
  en: 'English',
  el: 'Ελληνικά',
  es: 'Español',
  fa: 'فارسی',
  fi: 'Suomi',
  fr: 'Français',
  he: 'עברית',
  hi: 'हिन्दी',
  hu: 'Magyar',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ko: '한국어',
  ja: '日本語',
  nl: 'Nederlands',
  no: 'Norsk',
  pl: 'Polski',
  pt: 'Português',
  ro: 'Română',
  ru: 'Русский',
  sv: 'Svenska',
  th: 'ไทย',
  tr: 'Türkçe',
  uk: 'Українська',
  ur: 'اردو',
  vi: 'Tiếng Việt',
  zh: '中文',
}

export const SPROOCHLI_LANGUAGE_OPTIONS: SproochliLanguageOption[] = [
  { code: '', label: '', name: 'Original', source: 'original' },
  ...Object.keys(SPROOCHLI_LANGUAGE_NAMES).map((code) => ({
    code: code as SproochliChromeLanguage,
    label: SPROOCHLI_LANGUAGE_LABELS[code as SproochliChromeLanguage],
    name: SPROOCHLI_LANGUAGE_NAMES[code as SproochliChromeLanguage],
    source: 'public' as const,
  })),
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
    language === 'bo' ||
    language === 'nl' ||
    language === 'pl' ||
    language === 'tr' ||
    language === 'zh' ||
    language === 'ru' ||
    language === 'uk' ||
    language === 'hi' ||
    language === 'sv' ||
    language === 'da' ||
    language === 'no' ||
    language === 'fi' ||
    language === 'el' ||
    language === 'cs' ||
    language === 'ro' ||
    language === 'hu' ||
    language === 'th' ||
    language === 'vi' ||
    language === 'id' ||
    language === 'fa' ||
    language === 'ur'
    ? language
    : ''
}

function normalizeLanguageList(value: unknown): SproochliChromeLanguage[] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => normalizeSproochliLanguage(entry))
    .filter((entry): entry is SproochliChromeLanguage => Boolean(entry))
}

function uniqueLanguages(values: SproochliChromeLanguage[]): SproochliChromeLanguage[] {
  return [...new Set(values)]
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
  input: unknown
): SproochliLanguageOption[] {
  const config =
    input && typeof input === 'object'
      ? (input as SproochliLanguageOptionsInput)
      : { enabled: input }
  const enabled = config.enabled === true

  if (!enabled) {
    return [{ code: '', label: '', name: 'Original', source: 'original' }]
  }

  const defaultLanguage = normalizeSproochliLanguage(config.defaultLanguage)
  const attachedLanguages = uniqueLanguages([
    ...(defaultLanguage ? [defaultLanguage] : []),
    ...normalizeLanguageList(config.attachedLanguages),
  ])
  const cachedLanguages = uniqueLanguages(
    normalizeLanguageList(config.cachedLanguages).filter(
      (language) => !attachedLanguages.includes(language)
    )
  )
  const publicLanguages = uniqueLanguages(
    normalizeLanguageList(config.publicLanguages).filter(
      (language) =>
        !attachedLanguages.includes(language) && !cachedLanguages.includes(language)
    )
  )
  const configuredLanguageSet = new Set([
    ...attachedLanguages,
    ...cachedLanguages,
    ...publicLanguages,
  ])
  const onDemandLanguages = uniqueLanguages(
    (
      normalizeLanguageList(config.onDemandLanguages).length
        ? normalizeLanguageList(config.onDemandLanguages)
        : SPROOCHLI_LANGUAGE_OPTIONS
            .map((option) => option.code)
            .filter((code): code is SproochliChromeLanguage => Boolean(code))
    ).filter((language) => !configuredLanguageSet.has(language))
  )
  const configuredLanguages = uniqueLanguages([
    ...attachedLanguages,
    ...cachedLanguages,
    ...publicLanguages,
  ])
  const sourceFor = (
    language: SproochliChromeLanguage
  ): SproochliLanguageOption['source'] => {
    if (attachedLanguages.includes(language)) return 'attached'
    if (cachedLanguages.includes(language)) return 'cache'
    return 'public'
  }
  const languageOptions = configuredLanguages.map((language) => ({
    code: language,
    label: SPROOCHLI_LANGUAGE_LABELS[language],
    name: SPROOCHLI_LANGUAGE_NAMES[language],
    source: sourceFor(language),
  }))
  const onDemandOptions = onDemandLanguages.map((language) => ({
    code: language,
    label: SPROOCHLI_LANGUAGE_LABELS[language],
    name: SPROOCHLI_LANGUAGE_NAMES[language],
    source: 'on_demand' as const,
  }))

  return enabled === true
    ? [
        { code: '', label: '', name: 'Original', source: 'original' },
        ...languageOptions,
        ...onDemandOptions,
      ]
    : [{ code: '', label: '', name: 'Original', source: 'original' }]
}

export function resolveSproochliLanguageState(input: {
  enabled?: unknown
  defaultLanguage?: unknown
  attachedLanguages?: unknown
  cachedLanguages?: unknown
  publicLanguages?: unknown
  onDemandLanguages?: unknown
} = {}): SproochliLanguageState {
  const options = resolveSproochliLanguageOptions(input)

  return {
    primaryLanguage: normalizeSproochliLanguage(input.defaultLanguage),
    defaultLanguage: normalizeSproochliLanguage(input.defaultLanguage),
    attachedLanguages: uniqueLanguages(normalizeLanguageList(input.attachedLanguages)),
    cachedLanguages: uniqueLanguages(normalizeLanguageList(input.cachedLanguages)),
    selectableLanguages: options.map((option) => option.code),
    options,
  }
}
