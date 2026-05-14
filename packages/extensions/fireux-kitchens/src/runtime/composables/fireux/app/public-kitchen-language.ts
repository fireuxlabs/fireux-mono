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

export type PublicTranslatedTextResult = {
  text: string
  missingTranslation: boolean
  requestedLanguage: PublicKitchenLanguageCode
  fallbackUsed: boolean
}

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

export const PUBLIC_KITCHEN_LANGUAGE_OPTIONS: Array<{
  code: PublicKitchenLanguageCode
  label: string
}> = [
  { code: '', label: 'Original' },
  { code: 'de', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.de },
  { code: 'en', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.en },
  { code: 'it', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.it },
  { code: 'fr', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.fr },
  { code: 'ar', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.ar },
  { code: 'es', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.es },
  { code: 'pt', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.pt },
  { code: 'he', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.he },
  { code: 'ko', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.ko },
  { code: 'ja', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.ja },
  { code: 'bo', label: PUBLIC_KITCHEN_LANGUAGE_LABELS.bo },
]

export const PUBLIC_KITCHEN_CHROME_LABELS = {
  de: {
    menus: 'Menüs',
    chooseMenu: 'Menü auswählen',
    openMenus: 'Menüs öffnen',
    openMenu: 'Menü öffnen',
    loadingMenus: 'Menüs werden geladen...',
    noMenusAvailable: 'Keine Menüs verfügbar',
    noPublicMenus: 'Diese Küche hat noch keine öffentlichen Menüs.',
    loadingMenu: 'Menü wird geladen...',
    kitchenNotFound: 'Küche nicht gefunden',
    menuNotFound: 'Menü nicht gefunden',
    noSectionsFound: 'Keine Bereiche gefunden',
    menuJson: 'Menü JSON',
    section: 'Bereich',
    sections: 'Bereiche',
    dish: 'Gericht',
    dishes: 'Gerichte',
  },
  en: {
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
  },
  it: {
    menus: 'Menu',
    chooseMenu: 'Scegli un menu',
    openMenus: 'Apri i menu',
    openMenu: 'Apri il menu',
    loadingMenus: 'Caricamento dei menu...',
    noMenusAvailable: 'Nessun menu disponibile',
    noPublicMenus: 'Questo ristorante non ha ancora menu pubblici disponibili.',
    loadingMenu: 'Caricamento del menu...',
    kitchenNotFound: 'Ristorante non trovato',
    menuNotFound: 'Menu non trovato',
    noSectionsFound: 'Nessuna sezione trovata',
    menuJson: 'Menu JSON',
    section: 'sezione',
    sections: 'sezioni',
    dish: 'piatto',
    dishes: 'piatti',
  },
  fr: {
    menus: 'Menus',
    chooseMenu: 'Choisir un menu',
    openMenus: 'Ouvrir les menus',
    openMenu: 'Ouvrir le menu',
    loadingMenus: 'Chargement des menus...',
    noMenusAvailable: 'Aucun menu disponible',
    noPublicMenus: 'Cette cuisine n’a pas encore de menus publics.',
    loadingMenu: 'Chargement du menu...',
    kitchenNotFound: 'Cuisine introuvable',
    menuNotFound: 'Menu introuvable',
    noSectionsFound: 'Aucune section trouvée',
    menuJson: 'Menu JSON',
    section: 'section',
    sections: 'sections',
    dish: 'plat',
    dishes: 'plats',
  },
  es: {
    menus: 'Menús',
    chooseMenu: 'Elige un menú',
    openMenus: 'Abrir menús',
    openMenu: 'Abrir menú',
    loadingMenus: 'Cargando menús...',
    noMenusAvailable: 'No hay menús disponibles',
    noPublicMenus: 'Este restaurante aún no tiene menús públicos disponibles.',
    loadingMenu: 'Cargando menú...',
    kitchenNotFound: 'Restaurante no encontrado',
    menuNotFound: 'Menú no encontrado',
    noSectionsFound: 'No se encontraron secciones',
    menuJson: 'Menu JSON',
    section: 'sección',
    sections: 'secciones',
    dish: 'plato',
    dishes: 'platos',
  },
  pt: {
    menus: 'Menus',
    chooseMenu: 'Escolha um menu',
    openMenus: 'Abrir menus',
    openMenu: 'Abrir menu',
    loadingMenus: 'A carregar menus...',
    noMenusAvailable: 'Nenhum menu disponível',
    noPublicMenus: 'Este restaurante ainda não tem menus públicos disponíveis.',
    loadingMenu: 'A carregar menu...',
    kitchenNotFound: 'Restaurante não encontrado',
    menuNotFound: 'Menu não encontrado',
    noSectionsFound: 'Nenhuma secção encontrada',
    menuJson: 'Menu JSON',
    section: 'secção',
    sections: 'secções',
    dish: 'prato',
    dishes: 'pratos',
  },
  ar: {
    menus: 'القوائم',
    chooseMenu: 'اختر قائمة',
    openMenus: 'افتح القوائم',
    openMenu: 'افتح القائمة',
    loadingMenus: 'جاري تحميل القوائم...',
    noMenusAvailable: 'لا توجد قوائم متاحة',
    noPublicMenus: 'لا توجد قوائم عامة متاحة لهذا المطعم بعد.',
    loadingMenu: 'جاري تحميل القائمة...',
    kitchenNotFound: 'لم يتم العثور على المطعم',
    menuNotFound: 'لم يتم العثور على القائمة',
    noSectionsFound: 'لم يتم العثور على أقسام',
    menuJson: 'Menu JSON',
    section: 'قسم',
    sections: 'أقسام',
    dish: 'طبق',
    dishes: 'أطباق',
  },
  he: {
    menus: 'תפריטים',
    chooseMenu: 'בחרו תפריט',
    openMenus: 'פתחו תפריטים',
    openMenu: 'פתחו תפריט',
    loadingMenus: 'טוען תפריטים...',
    noMenusAvailable: 'אין תפריטים זמינים',
    noPublicMenus: 'למסעדה זו עדיין אין תפריטים ציבוריים.',
    loadingMenu: 'טוען תפריט...',
    kitchenNotFound: 'המסעדה לא נמצאה',
    menuNotFound: 'התפריט לא נמצא',
    noSectionsFound: 'לא נמצאו קטגוריות',
    menuJson: 'Menu JSON',
    section: 'קטגוריה',
    sections: 'קטגוריות',
    dish: 'מנה',
    dishes: 'מנות',
  },
  ko: {
    menus: '메뉴',
    chooseMenu: '메뉴 선택',
    openMenus: '메뉴 열기',
    openMenu: '메뉴 열기',
    loadingMenus: '메뉴를 불러오는 중...',
    noMenusAvailable: '이용 가능한 메뉴가 없습니다',
    noPublicMenus: '이 레스토랑에는 아직 공개 메뉴가 없습니다.',
    loadingMenu: '메뉴를 불러오는 중...',
    kitchenNotFound: '레스토랑을 찾을 수 없습니다',
    menuNotFound: '메뉴를 찾을 수 없습니다',
    noSectionsFound: '섹션을 찾을 수 없습니다',
    menuJson: 'Menu JSON',
    section: '섹션',
    sections: '섹션',
    dish: '요리',
    dishes: '요리',
  },
  ja: {
    menus: 'メニュー',
    chooseMenu: 'メニューを選択',
    openMenus: 'メニューを開く',
    openMenu: 'メニューを開く',
    loadingMenus: 'メニューを読み込み中...',
    noMenusAvailable: '利用可能なメニューはありません',
    noPublicMenus: 'このレストランにはまだ公開メニューがありません。',
    loadingMenu: 'メニューを読み込み中...',
    kitchenNotFound: 'レストランが見つかりません',
    menuNotFound: 'メニューが見つかりません',
    noSectionsFound: 'セクションが見つかりません',
    menuJson: 'Menu JSON',
    section: 'セクション',
    sections: 'セクション',
    dish: '料理',
    dishes: '料理',
  },
  bo: {
    menus: 'ཟས་ཐོ་',
    chooseMenu: 'ཟས་ཐོ་འདེམས་',
    openMenus: 'ཟས་ཐོ་ཁ་ཕྱེ་',
    openMenu: 'ཟས་ཐོ་ཁ་ཕྱེ་',
    loadingMenus: 'ཟས་ཐོ་འགེལ་བཞིན་ཡོད་...',
    noMenusAvailable: 'ཟས་ཐོ་མེད་',
    noPublicMenus: 'ཟ་ཁང་འདིར་ད་དུང་སྤྱི་སྤྱོད་ཟས་ཐོ་མེད།',
    loadingMenu: 'ཟས་ཐོ་འགེལ་བཞིན་ཡོད་...',
    kitchenNotFound: 'ཟ་ཁང་རྙེད་མ་སོང་',
    menuNotFound: 'ཟས་ཐོ་རྙེད་མ་སོང་',
    noSectionsFound: 'སྡེ་ཚན་རྙེད་མ་སོང་',
    menuJson: 'Menu JSON',
    section: 'སྡེ་ཚན་',
    sections: 'སྡེ་ཚན་',
    dish: 'ཟས་',
    dishes: 'ཟས་',
  },
} as const

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
): value is 'it' | 'fr' | 'ar' | 'es' | 'pt' | 'he' | 'ko' | 'ja' | 'bo' {
  const language = normalizePublicKitchenLanguage(value)
  return (
    language === 'it' ||
    language === 'fr' ||
    language === 'ar' ||
    language === 'es' ||
    language === 'pt' ||
    language === 'he' ||
    language === 'ko' ||
    language === 'ja' ||
    language === 'bo'
  )
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
): (typeof PUBLIC_KITCHEN_CHROME_LABELS)[PublicKitchenChromeLanguage] {
  const chromeLanguage = resolvePublicKitchenChromeLanguage({
    selectedLanguage: language,
  })

  return PUBLIC_KITCHEN_CHROME_LABELS[chromeLanguage]
}

export function resolvePublicTranslatedText(input: {
  defaultText?: unknown
  translations?: unknown
  selectedLanguage?: unknown
  cacheText?: unknown
}): PublicTranslatedTextResult {
  const sourceText = String(input.defaultText ?? '').trim()
  const requestedLanguage = normalizePublicKitchenLanguage(input.selectedLanguage)

  if (!requestedLanguage) {
    return {
      text: sourceText,
      missingTranslation: false,
      requestedLanguage,
      fallbackUsed: false,
    }
  }

  const cachedText = String(input.cacheText ?? '').trim()
  if (cachedText) {
    return {
      text: cachedText,
      missingTranslation: false,
      requestedLanguage,
      fallbackUsed: false,
    }
  }

  if (
    input.translations &&
    typeof input.translations === 'object' &&
    !Array.isArray(input.translations)
  ) {
    const translatedText = String(
      (input.translations as Record<string, unknown>)[requestedLanguage] ?? ''
    ).trim()
    if (translatedText) {
      return {
        text: translatedText,
        missingTranslation: false,
        requestedLanguage,
        fallbackUsed: false,
      }
    }
  }

  if (!sourceText) {
    return {
      text: '',
      missingTranslation: false,
      requestedLanguage,
      fallbackUsed: false,
    }
  }

  return {
    text: `[missing ${requestedLanguage} translation]`,
    missingTranslation: true,
    requestedLanguage,
    fallbackUsed: false,
  }
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
  // Public buttons are computed from language readiness. The kitchen primary/default
  // language only sets context/chrome and does not make a translation selectable.
  const publicLanguages = normalizeLanguageList(languageSettings.public_languages)
  const readyLanguages = publicLanguages.length
    ? publicLanguages
    : [...attachedLanguages, ...cachedLanguages]
  const seen = new Set<PublicKitchenLanguageCode>([''])
  const options: PublicKitchenLanguageOption[] = [
    { code: '', label: 'Original', source: 'original' },
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
      source,
    })
  }

  for (const language of readyLanguages) {
    const source =
      publicLanguages.length
        ? 'public'
        : attachedLanguages.includes(language)
          ? 'attached'
          : 'cache'
    addLanguage(language, source)
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
