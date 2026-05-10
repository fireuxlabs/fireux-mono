import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: scoped guest-facing food record
 * Path: /kitchens/<kitchenId>/dishes/<dishId>
 * Owner app scope: Kitchen
 *
 * Dish is the first guest-facing semantic composition layer. It links to
 * kitchen-owned mise/prep components and root/shared ingredients by id.
 * Recipe/method cards can live behind mise/prep items later; they are not
 * active Dish semantics. Steps, allergens, pricing, stock, images, and
 * service workflow are not active on the Dish model yet.
 */
export type DishTranslatedText = Partial<Record<string, string>>

export type DishMenuPlacement = {
  menu_id: string
  section_id: string
}

export const DishModel = {
  id: '' as string,
  name: '' as string,
  slug: '' as string,
  description: '' as string,
  source_language: '' as string,
  names: {} as DishTranslatedText,
  descriptions: {} as DishTranslatedText,
  translated: false as boolean,
  menu_placements: [] as DishMenuPlacement[],
  mise_ids: [] as string[],
  ingredient_ids: [] as string[],
  kitchen_id: '' as string,
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
} as const

export type Dish = {
  -readonly [K in keyof typeof DishModel]: (typeof DishModel)[K]
}

export type DishCreateInput = Omit<Dish, 'created' | 'updated'>
export type DishUpdateInput = Partial<
  Omit<Dish, 'id' | 'created' | 'updated' | 'kitchen_id'>
>

const pickString = (value: unknown) => String(value ?? '').trim()

export function normalizeDishStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return Array.from(
    new Set(value.map((entry) => pickString(entry)).filter(Boolean))
  )
}

export function normalizeDishMenuPlacements(value: unknown): DishMenuPlacement[] {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  const placements: DishMenuPlacement[] = []

  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
    const source = entry as Record<string, unknown>
    const menuId = pickString(source.menu_id)
    const sectionId = pickString(source.section_id)
    if (!menuId || !sectionId) continue

    const key = `${menuId}:${sectionId}`
    if (seen.has(key)) continue
    seen.add(key)
    placements.push({
      menu_id: menuId,
      section_id: sectionId,
    })
  }

  return placements
}

export function normalizeDishTranslatedText(value: unknown): DishTranslatedText {
  if (typeof value === 'string') {
    const text = pickString(value)
    return text ? { en: text } : {}
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const translated: DishTranslatedText = {}
  for (const [language, text] of Object.entries(value as Record<string, unknown>)) {
    const code = pickString(language).replace(/_/g, '-')
    const copy = pickString(text)
    if (code && copy) translated[code] = copy
  }

  return translated
}

export function normalizeDish(value: unknown): Dish {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const created = source.created && typeof source.created === 'object'
    ? (source.created as Dish['created'])
    : DishModel.created
  const updated = source.updated && typeof source.updated === 'object'
    ? (source.updated as Dish['updated'])
    : DishModel.updated

  return {
    ...DishModel,
    id: pickString(source.id),
    name: pickString(source.name),
    slug: pickString(source.slug),
    description: pickString(source.description),
    source_language: pickString(source.source_language),
    names: normalizeDishTranslatedText(source.names),
    descriptions: normalizeDishTranslatedText(source.descriptions),
    translated: source.translated === true,
    menu_placements: normalizeDishMenuPlacements(source.menu_placements),
    mise_ids: normalizeDishStringArray(source.mise_ids),
    ingredient_ids: normalizeDishStringArray(source.ingredient_ids),
    kitchen_id: pickString(source.kitchen_id),
    created,
    updated,
  }
}
