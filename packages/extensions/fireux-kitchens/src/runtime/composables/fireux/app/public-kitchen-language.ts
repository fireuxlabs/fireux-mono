type PublicKitchenChromeLanguage = 'de' | 'en' | 'it' | 'fr' | 'ar' | 'es' | 'pt'
export type PublicKitchenLanguageCode = '' | PublicKitchenChromeLanguage

export type PublicKitchenLanguageOption = {
  code: PublicKitchenLanguageCode
  label: string
}

const PUBLIC_KITCHEN_LANGUAGE_LABELS: Record<PublicKitchenChromeLanguage, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷',
  ar: 'العربية',
  es: '🇪🇸',
  pt: '🇵🇹',
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
    language === 'pt'
    ? language
    : ''
}

export function isPublicKitchenCacheLanguage(
  value: unknown
): value is 'fr' | 'ar' | 'es' | 'pt' {
  const language = normalizePublicKitchenLanguage(value)
  return language === 'fr' || language === 'ar' || language === 'es' || language === 'pt'
}

export function isPublicKitchenRtlLanguage(value: unknown): boolean {
  return normalizePublicKitchenLanguage(value) === 'ar'
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

export function resolvePublicKitchenLanguageOptions(
  kitchen: unknown
): PublicKitchenLanguageOption[] {
  const kitchenRecord =
    kitchen && typeof kitchen === 'object'
      ? (kitchen as Record<string, unknown>)
      : null
  const settings =
    kitchen && typeof kitchen === 'object'
      ? (kitchen as Record<string, unknown>).language_settings
      : null
  const seen = new Set<PublicKitchenLanguageCode>([''])
  const options: PublicKitchenLanguageOption[] = [{ code: '', label: 'Original' }]
  const languageSettings =
    settings && typeof settings === 'object' && !Array.isArray(settings)
      ? (settings as Record<string, unknown>)
      : {}
  const addLanguage = (value: unknown) => {
    const code = normalizePublicKitchenLanguage(value)
    if (!code || seen.has(code)) return

    seen.add(code)
    options.push({
      code,
      label: PUBLIC_KITCHEN_LANGUAGE_LABELS[code],
    })
  }

  addLanguage(kitchenRecord?.primary_language)
  addLanguage(languageSettings.default_language)

  for (const key of [
    'attached_languages',
    'certified_languages',
    'cache_languages',
    'cached_languages',
    'supported_languages',
  ]) {
    const languages = languageSettings[key]
    if (!Array.isArray(languages)) continue

    for (const value of languages) {
      addLanguage(value)
    }
  }

  return options
}
