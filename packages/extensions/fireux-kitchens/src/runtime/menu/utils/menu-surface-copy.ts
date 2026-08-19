export type MenuBrowseSurfaceCopy = {
  allergyAriaLabel: string
  allergyTitle: string
  allergyBody: string
  menuSectionsAriaLabel: string
  chooseMenuSectionAriaLabel: string
  sectionsLabel: string
  availableOptionsLabel: string
  optionalExtrasLabel: string
  emptyCatalogueLabel: string
  backToMenusLabel: string
  closeMenuLabel: string
  pricesLabel: string
}

export const MENU_SURFACE_COPY_VERSION = 'v3'

export const MENU_BROWSE_SURFACE_COPY_FIELDS = [
  {
    key: 'allergyAriaLabel',
    id: 'menu-surface:v3:browse:allergy-aria-label',
    sourceText: 'Allergy information',
  },
  {
    key: 'allergyTitle',
    id: 'menu-surface:v3:browse:allergy-title',
    sourceText: 'Allergies or intolerances?',
  },
  {
    key: 'allergyBody',
    id: 'menu-surface:v3:browse:allergy-body',
    sourceText:
      'Please ask the kitchen about allergies or dietary requirements.',
  },
  {
    key: 'menuSectionsAriaLabel',
    id: 'menu-surface:v3:browse:menu-sections-aria-label',
    sourceText: 'Menu sections',
  },
  {
    key: 'chooseMenuSectionAriaLabel',
    id: 'menu-surface:v3:browse:choose-menu-section-aria-label',
    sourceText: 'Choose menu section',
  },
  {
    key: 'sectionsLabel',
    id: 'menu-surface:v3:browse:sections-label',
    sourceText: 'Sections',
  },
  {
    key: 'availableOptionsLabel',
    id: 'menu-surface:v3:browse:available-options-label',
    sourceText: 'Available options',
  },
  {
    key: 'optionalExtrasLabel',
    id: 'menu-surface:v3:browse:optional-extras-label',
    sourceText: 'Optional extras',
  },
  {
    key: 'emptyCatalogueLabel',
    id: 'menu-surface:v3:browse:empty-catalogue-label',
    sourceText: 'No menu items are published yet.',
  },
  {
    key: 'backToMenusLabel',
    id: 'menu-surface:v3:browse:back-to-menus-label',
    sourceText: 'Back to menus',
  },
  {
    key: 'closeMenuLabel',
    id: 'menu-surface:v3:browse:close-menu-label',
    sourceText: 'Close menu',
  },
  {
    key: 'pricesLabel',
    id: 'menu-surface:v3:browse:prices-label',
    sourceText: 'Prices',
  },
] as const

const GERMAN_MENU_BROWSE_SURFACE_COPY = new Map<string, string>([
  ['menu-surface:v3:browse:allergy-aria-label', 'Allergieinformationen'],
  [
    'menu-surface:v3:browse:allergy-title',
    'Allergien oder Unverträglichkeiten?',
  ],
  [
    'menu-surface:v3:browse:allergy-body',
    'Bitte informieren Sie unser Team über Allergien oder besondere Ernährungsbedürfnisse.',
  ],
  ['menu-surface:v3:browse:menu-sections-aria-label', 'Menübereiche'],
  [
    'menu-surface:v3:browse:choose-menu-section-aria-label',
    'Menübereich auswählen',
  ],
  ['menu-surface:v3:browse:sections-label', 'Bereiche'],
  ['menu-surface:v3:browse:available-options-label', 'Verfügbare Optionen'],
  ['menu-surface:v3:browse:optional-extras-label', 'Optionale Extras'],
  [
    'menu-surface:v3:browse:empty-catalogue-label',
    'Es sind noch keine Menüeinträge veröffentlicht.',
  ],
  ['menu-surface:v3:browse:back-to-menus-label', 'Zurück zu den Menüs'],
  ['menu-surface:v3:browse:close-menu-label', 'Menü schliessen'],
  ['menu-surface:v3:browse:prices-label', 'Preise'],
])

const text = (value: unknown) => String(value ?? '').trim()

export function isMenuBrowseSurfaceCopyField(value: unknown): boolean {
  const id = text(value)

  return MENU_BROWSE_SURFACE_COPY_FIELDS.some((field) => field.id === id)
}

export function resolveMenuBrowseSurfaceCopy(
  translations?: ReadonlyMap<string, string> | null,
  defaultLanguage?: string
): MenuBrowseSurfaceCopy {
  const copy = {} as MenuBrowseSurfaceCopy
  const defaults =
    defaultLanguage === 'de' ? GERMAN_MENU_BROWSE_SURFACE_COPY : null

  for (const field of MENU_BROWSE_SURFACE_COPY_FIELDS) {
    copy[field.key] =
      text(translations?.get(field.id)) ||
      text(defaults?.get(field.id)) ||
      field.sourceText
  }

  return copy
}
