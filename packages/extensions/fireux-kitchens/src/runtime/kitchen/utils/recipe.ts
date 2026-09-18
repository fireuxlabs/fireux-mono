import { normalizeRecipePreparation } from '../models/recipe-preparation'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Recipe, RecipeTranslatedText } from '../models/recipe.model'

export type { Recipe, RecipeTranslatedText } from '../models/recipe.model'

export const RecipeStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/recipes/{recipeId}',
  collection: 'recipes',
  parent: 'kitchen',
  idParam: 'recipeId',
} as const

export const RecipeDefaults: Recipe = {
  id: '',
  name: '',
  slug: '',
  description: '',
  source_language: '',
  names: {},
  descriptions: {},
  kitchen_id: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
}

export type RecipeCreateInput = Omit<Recipe, 'created' | 'updated'>
export type RecipeUpdateInput = Partial<
  Omit<Recipe, 'id' | 'created' | 'updated' | 'kitchen_id'>
>

const text = (value: unknown) => String(value ?? '').trim()

export function normalizeTranslatedText(value: unknown): RecipeTranslatedText {
  if (typeof value === 'string') return text(value) ? { en: text(value) } : {}
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([language, copy]) => [
        text(language).replace(/_/g, '-'),
        text(copy),
      ])
      .filter(([language, copy]) => language && copy)
  )
}

export function normalizeRecipe(value: unknown): Recipe {
  const source =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    ...RecipeDefaults,
    id: text(source.id),
    name: text(source.name),
    slug: text(source.slug),
    description: text(source.description),
    source_language: text(source.source_language),
    names: normalizeTranslatedText(source.names),
    descriptions: normalizeTranslatedText(source.descriptions),
    kitchen_id: text(source.kitchen_id),
    preparation: normalizeRecipePreparation(source.preparation),
    created:
      source.created && typeof source.created === 'object'
        ? (source.created as Recipe['created'])
        : RecipeDefaults.created,
    updated:
      source.updated && typeof source.updated === 'object'
        ? (source.updated as Recipe['updated'])
        : RecipeDefaults.updated,
  }
}
