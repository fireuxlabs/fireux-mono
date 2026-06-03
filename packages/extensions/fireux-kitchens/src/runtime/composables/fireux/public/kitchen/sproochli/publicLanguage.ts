type PublicKitchenChromeLanguage =
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
export type PublicKitchenLanguageCode = '' | PublicKitchenChromeLanguage

export type PublicKitchenLanguageOption = {
  code: PublicKitchenLanguageCode
  label: string
  name: string
  source?: 'original' | 'attached' | 'cache' | 'public'
}

export type PublicKitchenLanguageState = {
  primaryLanguage: PublicKitchenChromeLanguage | ''
  defaultLanguage: PublicKitchenChromeLanguage | ''
  attachedLanguages: PublicKitchenChromeLanguage[]
  cachedLanguages: PublicKitchenChromeLanguage[]
  selectableLanguages: PublicKitchenLanguageCode[]
  options: PublicKitchenLanguageOption[]
}

export const PUBLIC_MENU_COPY_PACK_ID = 'public-menu' as const

export const PUBLIC_KITCHEN_CHROME_LABEL_KEYS = [
  'menus',
  'chooseMenu',
  'openMenus',
  'openMenu',
  'loadingMenus',
  'noMenusAvailable',
  'noPublicMenus',
  'loadingMenu',
  'kitchenNotFound',
  'menuNotFound',
  'noSectionsFound',
  'menuJson',
  'section',
  'sections',
  'dish',
  'dishes',
] as const

export type PublicKitchenChromeLabelKey =
  (typeof PUBLIC_KITCHEN_CHROME_LABEL_KEYS)[number]

export type PublicKitchenChromeLabels = Record<
  PublicKitchenChromeLabelKey,
  string
>

export type PublicMenuCopyPack = {
  labels?: Partial<Record<PublicKitchenChromeLabelKey, unknown>>
} & Partial<Record<PublicKitchenChromeLabelKey, unknown>>

const PUBLIC_KITCHEN_LANGUAGE_LABELS: Record<PublicKitchenChromeLanguage, string> = {
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

const PUBLIC_KITCHEN_LANGUAGE_NAMES: Record<PublicKitchenChromeLanguage, string> = {
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

export const PUBLIC_KITCHEN_LANGUAGE_OPTIONS: Array<{
  code: PublicKitchenLanguageCode
  label: string
  name: string
}> = [
  { code: '', label: 'Original', name: 'Original' },
  { code: 'de', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.de, name: PUBLIC_KITCHEN_LANGUAGE_NAMES.de },
  { code: 'en', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.en, name: PUBLIC_KITCHEN_LANGUAGE_NAMES.en },
  { code: 'it', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.it, name: PUBLIC_KITCHEN_LANGUAGE_NAMES.it },
  { code: 'fr', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.fr, name: PUBLIC_KITCHEN_LANGUAGE_NAMES.fr },
  { code: 'ar', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.ar, name: PUBLIC_KITCHEN_LANGUAGE_NAMES.ar },
  { code: 'es', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.es, name: PUBLIC_KITCHEN_LANGUAGE_NAMES.es },
  { code: 'pt', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.pt, name: PUBLIC_KITCHEN_LANGUAGE_NAMES.pt },
  { code: 'he', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.he, name: PUBLIC_KITCHEN_LANGUAGE_NAMES.he },
  { code: 'ko', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.ko, name: PUBLIC_KITCHEN_LANGUAGE_NAMES.ko },
  { code: 'ja', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.ja, name: PUBLIC_KITCHEN_LANGUAGE_NAMES.ja },
  { code: 'bo', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.bo, name: PUBLIC_KITCHEN_LANGUAGE_NAMES.bo },
]

export const PUBLIC_KITCHEN_CHROME_DEFAULT_LABELS: PublicKitchenChromeLabels = {
  menus: 'Menus',
  chooseMenu: 'Choose a menu',
  openMenus: 'Open menus',
  openMenu: 'Open menu',
  loadingMenus: 'Loading menus...',
  noMenusAvailable: 'No menus available',
  noPublicMenus: 'This kitchen does not have public menus available yet.',
  loadingMenu: 'Loading menu...',
  kitchenNotFound: 'Kitchen not found',
  menuNotFound: 'Menu not found',
  noSectionsFound: 'No sections found',
  menuJson: 'Menu JSON',
  section: 'section',
  sections: 'sections',
  dish: 'dish',
  dishes: 'dishes',
}

function readChromeLabels(value: unknown): Partial<PublicKitchenChromeLabels> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const record = value as PublicMenuCopyPack
  const nested =
    record.labels && typeof record.labels === 'object' && !Array.isArray(record.labels)
      ? record.labels
      : {}
  const labels: Partial<PublicKitchenChromeLabels> = {}

  for (const key of PUBLIC_KITCHEN_CHROME_LABEL_KEYS) {
    const raw = nested[key] ?? record[key]
    if (typeof raw === 'string' && raw.trim()) {
      labels[key] = raw.trim()
    }
  }

  return labels
}

export function resolvePublicKitchenChromeLabels(input: {
  ecosystemPack?: unknown
  tenantPack?: unknown
} = {}): PublicKitchenChromeLabels {
  return {
    ...PUBLIC_KITCHEN_CHROME_DEFAULT_LABELS,
    ...readChromeLabels(input.ecosystemPack),
    ...readChromeLabels(input.tenantPack),
  }
}

export function normalizePublicKitchenLanguage(
  value: unknown
): PublicKitchenLanguageCode {
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

export function isPublicKitchenCacheLanguage(
  value: unknown
): value is Exclude<PublicKitchenLanguageCode, ''> {
  return Boolean(normalizePublicKitchenLanguage(value))
}

function normalizePublicKitchenText(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function resolveTranslationRecordText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return normalizePublicKitchenText(value)
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''

  const record = value as Record<string, unknown>
  return (
    normalizePublicKitchenText(record.text) ||
    normalizePublicKitchenText(record.value) ||
    normalizePublicKitchenText(record.label) ||
    normalizePublicKitchenText(record.name) ||
    normalizePublicKitchenText(record.description)
  )
}

export function resolvePublicTranslatedText(input: {
  defaultText?: unknown
  translations?: unknown
  selectedLanguage?: unknown
  cacheText?: unknown
}): { text: string; source: 'cache' | 'translation' | 'default' | 'missing' } {
  const cacheText = normalizePublicKitchenText(input.cacheText)
  if (cacheText) return { text: cacheText, source: 'cache' }

  const language = normalizePublicKitchenLanguage(input.selectedLanguage)
  const translations =
    input.translations && typeof input.translations === 'object' && !Array.isArray(input.translations)
      ? (input.translations as Record<string, unknown>)
      : null

  if (language && translations) {
    const translatedText = resolveTranslationRecordText(translations[language])
    if (translatedText) return { text: translatedText, source: 'translation' }
  }

  const defaultText = normalizePublicKitchenText(input.defaultText)
  return defaultText
    ? { text: defaultText, source: 'default' }
    : { text: '', source: 'missing' }
}

export function isPublicKitchenRtlLanguage(value: unknown): boolean {
  const language = normalizePublicKitchenLanguage(value)
  return language === 'ar' || language === 'he'
}

export function resolvePublicKitchenChromeLanguage(input: {
  selectedLanguage?: unknown
  primaryLanguage?: unknown
}): PublicKitchenChromeLanguage {
  const selected = normalizePublicKitchenLanguage(input.selectedLanguage)
  if (selected) return selected

  const primary = normalizePublicKitchenLanguage(input.primaryLanguage)
  return primary || 'en'
}

export function getPublicKitchenChromeLabels(
  language: unknown
): PublicKitchenChromeLabels {
  resolvePublicKitchenChromeLanguage({
    selectedLanguage: language,
  })

  return resolvePublicKitchenChromeLabels()
}

export function resolvePublicKitchenLanguageOptions(
  kitchen: unknown
): PublicKitchenLanguageOption[] {
  return resolvePublicKitchenLanguageState(kitchen).options
}

export function resolvePublicKitchenLanguageState(
  kitchen: unknown
): PublicKitchenLanguageState {
  const kitchenRecord =
    kitchen && typeof kitchen === 'object'
      ? (kitchen as Record<string, unknown>)
      : null
  const settings =
    kitchen && typeof kitchen === 'object'
      ? (kitchen as Record<string, unknown>).language_settings
      : null
  const languageSettings =
    settings && typeof settings === 'object' && !Array.isArray(settings)
      ? (settings as Record<string, unknown>)
      : {}
  const primaryLanguage = normalizePublicKitchenLanguage(
    kitchenRecord?.primary_language
  ) as PublicKitchenChromeLanguage | ''
  const defaultLanguage = normalizePublicKitchenLanguage(
    languageSettings.default_language
  ) as PublicKitchenChromeLanguage | ''
  const normalizeLanguageList = (values: unknown): PublicKitchenChromeLanguage[] => {
    if (!Array.isArray(values)) return []

    const seen = new Set<PublicKitchenChromeLanguage>()
    const languages: PublicKitchenChromeLanguage[] = []

    for (const value of values) {
      const code = normalizePublicKitchenLanguage(value)
      if (!code || seen.has(code)) continue

      seen.add(code)
      languages.push(code)
    }

    return languages
  }
  const attachedLanguages = [
    ...normalizeLanguageList(languageSettings.attached_languages),
    ...normalizeLanguageList(languageSettings.certified_languages),
  ].filter((language, index, languages) => languages.indexOf(language) === index)
  const cachedLanguages = [
    ...normalizeLanguageList(languageSettings.cache_languages),
    ...normalizeLanguageList(languageSettings.cached_languages),
  ].filter((language, index, languages) => languages.indexOf(language) === index)
  const publicLanguages = normalizeLanguageList(languageSettings.public_languages)
  const seen = new Set<PublicKitchenLanguageCode>([''])
  const options: PublicKitchenLanguageOption[] = [
    { code: '', label: 'Original', name: 'Original', source: 'original' },
  ]
  const addLanguage = (
    value: unknown,
    source: PublicKitchenLanguageOption['source']
  ) => {
    const code = normalizePublicKitchenLanguage(value)
    if (!code || seen.has(code)) return

    seen.add(code)
    options.push({
      code,
      label: PUBLIC_KITCHEN_LANGUAGE_LABELS[code],
      name: PUBLIC_KITCHEN_LANGUAGE_NAMES[code],
      source,
    })
  }

  for (const language of publicLanguages) {
    addLanguage(language, 'public')
  }

  return {
    primaryLanguage,
    defaultLanguage,
    attachedLanguages,
    cachedLanguages,
    selectableLanguages: options.map((option) => option.code),
    options,
  }
}
