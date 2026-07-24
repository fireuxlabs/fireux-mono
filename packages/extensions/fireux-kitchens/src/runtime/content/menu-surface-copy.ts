export type MenuBrowseSurfaceCopy = {
  browseLabel: string
  browseDescription: string
  allergyAriaLabel: string
  allergyTitle: string
  allergyBody: string
}

export const MENU_SURFACE_COPY_VERSION = 'v1'

export const MENU_BROWSE_SURFACE_COPY_FIELDS = [
  {
    key: 'browseLabel',
    id: 'menu-surface:v1:browse:label',
    sourceText: 'Browse',
  },
  {
    key: 'browseDescription',
    id: 'menu-surface:v1:browse:description',
    sourceText: 'View the menu or choose how you would like to order.',
  },
  {
    key: 'allergyAriaLabel',
    id: 'menu-surface:v1:browse:allergy-aria-label',
    sourceText: 'Allergy information',
  },
  {
    key: 'allergyTitle',
    id: 'menu-surface:v1:browse:allergy-title',
    sourceText: 'Allergies or intolerances?',
  },
  {
    key: 'allergyBody',
    id: 'menu-surface:v1:browse:allergy-body',
    sourceText: 'Please ask the kitchen about allergies or dietary requirements.',
  },
] as const

const text = (value: unknown) => String(value ?? '').trim()

export function isMenuBrowseSurfaceCopyField(value: unknown): boolean {
  const id = text(value)

  return MENU_BROWSE_SURFACE_COPY_FIELDS.some(field => field.id === id)
}

export function resolveMenuBrowseSurfaceCopy(
  translations?: ReadonlyMap<string, string> | null
): MenuBrowseSurfaceCopy {
  const copy = {} as MenuBrowseSurfaceCopy

  for (const field of MENU_BROWSE_SURFACE_COPY_FIELDS) {
    copy[field.key] = text(translations?.get(field.id)) || field.sourceText
  }

  return copy
}
