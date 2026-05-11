export type PublicKitchenLanguageCode = '' | 'de' | 'en'
export type PublicKitchenChromeLanguage = 'de' | 'en'

export const PUBLIC_KITCHEN_LANGUAGE_OPTIONS: Array<{
  code: PublicKitchenLanguageCode
  labelKey: 'original' | 'german' | 'english'
}> = [
  { code: '', labelKey: 'original' },
  { code: 'de', labelKey: 'german' },
  { code: 'en', labelKey: 'english' },
]

export const PUBLIC_KITCHEN_CHROME_LABELS = {
  de: {
    original: 'Original',
    german: '🇩🇪',
    english: '🇬🇧',
    menus: 'Menüs',
    chooseMenu: 'Menü auswählen',
    openMenus: 'Menüs öffnen',
    openMenu: 'Menü öffnen',
    loadingMenus: 'Menüs werden geladen...',
    failedToLoadMenus: 'Menüs konnten nicht geladen werden',
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
    original: 'Original',
    german: '🇩🇪',
    english: '🇬🇧',
    menus: 'Menus',
    chooseMenu: 'Choose a menu',
    openMenus: 'Open menus',
    openMenu: 'Open menu',
    loadingMenus: 'Loading menus...',
    failedToLoadMenus: 'Failed to load menus',
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
} as const

export function normalizePublicKitchenLanguage(
  value: unknown
): PublicKitchenLanguageCode {
  const language = String(value ?? '').trim().replace(/_/g, '-').toLowerCase()
  return language === 'de' || language === 'en' ? language : ''
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
