import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped Entity
 * Storage: Kitchen-owned authored recipe content
 * Path: apps/{appId}/kitchens/{kitchenId}/recipes/{recipeId}
 * Owner app scope: Kitchen
 *
 * Recipe has its own lifecycle inside one Kitchen. It is not a root identity;
 * any future discovery surface must project it without moving its authority.
 * Steps, costing, allergens, method, ingredient lines, yield, and service
 * workflow are not active on the current model yet.
 */
export const RecipeStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/recipes/{recipeId}',
  collection: 'recipes',
  parent: 'kitchen',
  idParam: 'recipeId',
} as const

export const RecipeEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Recipe',
  family: ['kitchen'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  workspace: false,
  parent: 'Kitchen',
  scoped: RecipeStorage.path,
})

export type RecipeTranslatedText = Partial<Record<string, string>>

export const RecipeDefaults = {
  id: '' as string,
  name: '' as string,
  slug: '' as string,
  description: '' as string,
  source_language: '' as string,
  names: {} as RecipeTranslatedText,
  descriptions: {} as RecipeTranslatedText,
  kitchen_id: '' as string,
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
} as const

export type Recipe = {
  -readonly [K in keyof typeof RecipeDefaults]: (typeof RecipeDefaults)[K]
}

export type RecipeCreateInput = Omit<Recipe, 'created' | 'updated'>
export type RecipeUpdateInput = Partial<
  Omit<Recipe, 'id' | 'created' | 'updated' | 'kitchen_id'>
>

const pickString = (value: unknown) => String(value ?? '').trim()

export function normalizeTranslatedText(value: unknown): RecipeTranslatedText {
  if (typeof value === 'string') {
    const text = pickString(value)
    return text ? { en: text } : {}
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const translated: RecipeTranslatedText = {}
  for (const [language, text] of Object.entries(value as Record<string, unknown>)) {
    const code = pickString(language).replace(/_/g, '-')
    const copy = pickString(text)
    if (code && copy) translated[code] = copy
  }

  return translated
}

export function normalizeRecipe(value: unknown): Recipe {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const created = source.created && typeof source.created === 'object'
    ? (source.created as Recipe['created'])
    : RecipeDefaults.created
  const updated = source.updated && typeof source.updated === 'object'
    ? (source.updated as Recipe['updated'])
    : RecipeDefaults.updated

  return {
    ...RecipeDefaults,
    id: pickString(source.id),
    name: pickString(source.name),
    slug: pickString(source.slug),
    description: pickString(source.description),
    source_language: pickString(source.source_language),
    names: normalizeTranslatedText(source.names),
    descriptions: normalizeTranslatedText(source.descriptions),
    kitchen_id: pickString(source.kitchen_id),
    created,
    updated,
  }
}
