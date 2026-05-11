type PublicKitchenChromeLanguage = 'de' | 'en' | 'fr' | 'ar'
export type PublicKitchenLanguageCode = '' | PublicKitchenChromeLanguage

export const PUBLIC_KITCHEN_LANGUAGE_OPTIONS: Array<{
  code: PublicKitchenLanguageCode
  label: string
}> = [
  { code: '', label: 'Original' },
  { code: 'de', label: '🇩🇪' },
  { code: 'en', label: '🇬🇧' },
  { code: 'fr', label: '🇫🇷' },
  { code: 'ar', label: 'العربية' },
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
  return language === 'de' || language === 'en' || language === 'fr' || language === 'ar'
    ? language
    : ''
}

export function isPublicKitchenCacheLanguage(
  value: unknown
): value is 'fr' | 'ar' {
  const language = normalizePublicKitchenLanguage(value)
  return language === 'fr' || language === 'ar'
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
