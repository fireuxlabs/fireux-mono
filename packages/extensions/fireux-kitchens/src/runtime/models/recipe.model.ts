import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: scoped operational record
 * Path: /kitchens/<kitchenId>/recipes/<recipeId>
 * Owner app scope: Kitchen
 *
 * Decision note:
 * - Recipe is still the right concept: a recipe card in waiting.
 * - Early Misebox recipe setup stays intentionally small: identity, type,
 *   localized names/descriptions, internal notes, kitchen ownership, and stamps.
 * - Advanced kitchen-manager fields are parked as optional future extensions
 *   below so existing docs can be read without exposing those fields in the
 *   primary recipe UI today.
 */

export type LocaleCode = 'it' | 'de' | 'en' | 'fr'
export type LocalizedText = Partial<Record<LocaleCode, string>>
export type RecipeType = 'prep' | 'service'

export const RECIPE_LOCALES = ['it', 'de', 'en', 'fr'] as const

export const RecipeModel = {
  id: '' as string,
  name: '' as string,
  slug: '' as string,
  recipe_type: 'prep' as RecipeType,
  default_locale: 'en' as LocaleCode,
  names: {} as LocalizedText,
  descriptions: {} as LocalizedText,
  notes: '' as string,
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

/**
 * Future recipe card extensions, deliberately not part of RecipeModel yet:
 *
 * workflow_status, visibility, protection_level, access_policy,
 * publication_status, published_summary, author_chef_id, author_user_id,
 * ingredient_lines, steps, yield_qty, yield_unit, prep_minutes, cook_minutes,
 * dietary_flags, cuisine_types, tags, primary_dish_id, source_recipe_id,
 * source_kitchen_id, archived_at, archived_by, published_at, published_by.
 *
 * These remain optional on Recipe for compatibility with older/demo docs and
 * can be promoted back into the active model one piece at a time.
 */
export type WorkflowStatus = 'draft' | 'active' | 'archived'
export type RecipeVisibility = 'private' | 'team' | 'shared' | 'public'
export type ProtectionLevel = 'standard' | 'confidential' | 'secret'
export type PublicationStatus = 'unpublished' | 'published' | 'withdrawn'
export type DifficultyLevel = 'easy' | 'moderate' | 'advanced'
export type RecipePolicyRole =
  | 'kitchen_admin'
  | 'kitchen_editor'
  | 'author_chef'
  | 'team_member'
  | 'app_admin'
export type DuplicateScope = 'blocked' | 'same_kitchen_only' | 'approved_shared_import'

export type RecipeIngredientLine = {
  id: string
  ingredient_id?: string
  ingredient_name: string
  quantity: number
  unit: string
  prep_note?: string
}

export type RecipeStep = {
  id: string
  order: number
  title?: string
  instruction: string
  minutes?: number
}

export type RecipeAccessPolicy = {
  metadata_read_roles: RecipePolicyRole[]
  method_read_roles: RecipePolicyRole[]
  edit_roles: RecipePolicyRole[]
  publish_roles: RecipePolicyRole[]
  export_roles: RecipePolicyRole[]
  duplicate_scope: DuplicateScope
  shared_kitchen_ids?: string[]
}

export type PublishedRecipeSummary = {
  title: string
  description: string
  hero_image_url?: string
  cuisine_types?: string[]
  dietary_flags?: string[]
  difficulty_level?: DifficultyLevel
}

export type RecipeFutureFields = {
  workflow_status?: WorkflowStatus
  archived_at?: FirebaseTimestamp
  archived_by?: string
  visibility?: RecipeVisibility
  protection_level?: ProtectionLevel
  access_policy?: RecipeAccessPolicy
  description?: string
  ingredient_lines?: RecipeIngredientLine[]
  steps?: RecipeStep[]
  tags?: string[]
  cuisine_types?: string[]
  dietary_flags?: string[]
  difficulty_level?: DifficultyLevel
  yield_qty?: number
  yield_unit?: string
  prep_minutes?: number
  cook_minutes?: number
  primary_dish_id?: string
  source_recipe_id?: string
  source_kitchen_id?: string
  author_chef_id?: string
  author_user_id?: string
  publication_status?: PublicationStatus
  published_at?: FirebaseTimestamp
  published_by?: string
  published_summary?: PublishedRecipeSummary
}

export type Recipe = {
  [K in keyof typeof RecipeModel]: (typeof RecipeModel)[K]
} & Partial<RecipeFutureFields>

export type RecipeCreateInput = Omit<Recipe, 'created' | 'updated'>
export type RecipeUpdateInput = Partial<
  Omit<Recipe, 'id' | 'created' | 'updated' | 'kitchen_id'>
>

const LOCALE_VALUES = new Set<LocaleCode>(RECIPE_LOCALES)
const RECIPE_TYPE_VALUES = new Set<RecipeType>(['prep', 'service'])
const WORKFLOW_VALUES = new Set<WorkflowStatus>(['draft', 'active', 'archived'])
const VISIBILITY_VALUES = new Set<RecipeVisibility>(['private', 'team', 'shared', 'public'])
const PROTECTION_VALUES = new Set<ProtectionLevel>(['standard', 'confidential', 'secret'])
const PUBLICATION_VALUES = new Set<PublicationStatus>(['unpublished', 'published', 'withdrawn'])
const DIFFICULTY_VALUES = new Set<DifficultyLevel>(['easy', 'moderate', 'advanced'])

const pickString = (value: unknown) => String(value || '').trim()
const pickOptionalString = (value: unknown) => pickString(value) || undefined
const pickNumber = (value: unknown) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}
const pickStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map((entry) => pickString(entry)).filter(Boolean)
    : undefined

function pickEnum<T extends string>(
  value: unknown,
  allowed: Set<T>,
  fallback: T
): T {
  const resolved = pickString(value) as T
  return allowed.has(resolved) ? resolved : fallback
}

const pickLocale = (value: unknown, fallback: LocaleCode = 'en'): LocaleCode =>
  pickEnum(pickString(value).replace(/_/g, '-').toLowerCase(), LOCALE_VALUES, fallback)

export function normalizeLocalizedText(
  value: unknown,
  defaultLocale: LocaleCode = 'en'
): LocalizedText {
  if (typeof value === 'string') {
    const text = pickString(value)
    return text ? { [defaultLocale]: text } : {}
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([locale, text]) => [
        pickString(locale).replace(/_/g, '-').toLowerCase(),
        pickString(text),
      ])
      .filter(([locale]) => LOCALE_VALUES.has(locale as LocaleCode))
  ) as LocalizedText
}

function normalizeInternalNotes(value: unknown, defaultLocale: LocaleCode = 'en'): string {
  if (typeof value === 'string') return pickString(value)
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''

  const localized = normalizeLocalizedText(value, defaultLocale)
  return (
    localized[defaultLocale] ||
    localized.en ||
    localized.de ||
    localized.it ||
    localized.fr ||
    ''
  )
}

const normalizeRecipeIngredientLines = (value: unknown): RecipeIngredientLine[] | undefined => {
  if (!Array.isArray(value)) return undefined

  return value.map((entry, index) => {
    const source = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {}
    return {
      id: pickString(source.id) || `ingredient-line-${index + 1}`,
      ingredient_id: pickOptionalString(source.ingredient_id),
      ingredient_name: pickString(source.ingredient_name),
      quantity: pickNumber(source.quantity) || 0,
      unit: pickString(source.unit),
      prep_note: pickOptionalString(source.prep_note),
    }
  })
}

const normalizeRecipeSteps = (value: unknown): RecipeStep[] | undefined => {
  if (!Array.isArray(value)) return undefined

  return value.map((entry, index) => {
    const source = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {}
    return {
      id: pickString(source.id) || `recipe-step-${index + 1}`,
      order: pickNumber(source.order) || index + 1,
      title: pickOptionalString(source.title),
      instruction: pickString(source.instruction),
      minutes: pickNumber(source.minutes),
    }
  })
}

const normalizePublishedRecipeSummary = (value: unknown): PublishedRecipeSummary | undefined => {
  if (!value || typeof value !== 'object') return undefined

  const source = value as Record<string, unknown>
  const title = pickString(source.title)
  const description = pickString(source.description)
  if (!title && !description) return undefined

  return {
    title,
    description,
    hero_image_url: pickOptionalString(source.hero_image_url),
    cuisine_types: pickStringArray(source.cuisine_types),
    dietary_flags: pickStringArray(source.dietary_flags),
    difficulty_level:
      source.difficulty_level === undefined
        ? undefined
        : pickEnum(source.difficulty_level, DIFFICULTY_VALUES, 'moderate'),
  }
}

const compactFutureFields = (fields: RecipeFutureFields): Partial<RecipeFutureFields> =>
  Object.fromEntries(
    Object.entries(fields).filter(([, value]) => {
      if (value === undefined || value === '') return false
      if (Array.isArray(value)) return value.length > 0
      return true
    })
  ) as Partial<RecipeFutureFields>

export function normalizeRecipe(value: unknown): Recipe {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const created = source.created && typeof source.created === 'object'
    ? (source.created as Recipe['created'])
    : RecipeModel.created
  const updated = source.updated && typeof source.updated === 'object'
    ? (source.updated as Recipe['updated'])
    : RecipeModel.updated
  const id = pickString(source.id)
  const defaultLocale = pickLocale(source.default_locale)
  const names = normalizeLocalizedText(source.names, defaultLocale)
  const name =
    pickString(source.name) ||
    names[defaultLocale] ||
    pickString(source.title) ||
    id

  return {
    ...RecipeModel,
    id,
    name,
    slug: pickString(source.slug) || id,
    recipe_type: pickEnum(source.recipe_type, RECIPE_TYPE_VALUES, 'prep'),
    default_locale: defaultLocale,
    names,
    descriptions: normalizeLocalizedText(
      source.descriptions ?? source.description,
      defaultLocale
    ),
    notes: normalizeInternalNotes(source.notes, defaultLocale),
    kitchen_id: pickString(source.kitchen_id),
    created,
    updated,
    ...compactFutureFields({
      workflow_status:
        source.workflow_status !== undefined || source.status !== undefined
          ? pickEnum(source.workflow_status ?? source.status, WORKFLOW_VALUES, 'draft')
          : undefined,
      archived_at: (source.archived_at as FirebaseTimestamp | undefined) ?? undefined,
      archived_by: pickOptionalString(source.archived_by),
      visibility:
        source.visibility !== undefined
          ? pickEnum(source.visibility, VISIBILITY_VALUES, 'team')
          : undefined,
      protection_level:
        source.protection_level !== undefined
          ? pickEnum(source.protection_level, PROTECTION_VALUES, 'standard')
          : undefined,
      description: pickOptionalString(source.description),
      ingredient_lines: normalizeRecipeIngredientLines(source.ingredient_lines),
      steps: normalizeRecipeSteps(source.steps),
      tags: pickStringArray(source.tags),
      cuisine_types: pickStringArray(source.cuisine_types ?? source.cuisine_type),
      dietary_flags: pickStringArray(source.dietary_flags ?? source.dietary_restrictions),
      difficulty_level:
        source.difficulty_level === undefined
          ? undefined
          : pickEnum(source.difficulty_level, DIFFICULTY_VALUES, 'moderate'),
      yield_qty: pickNumber(source.yield_qty),
      yield_unit: pickOptionalString(source.yield_unit),
      prep_minutes: pickNumber(source.prep_minutes),
      cook_minutes: pickNumber(source.cook_minutes),
      primary_dish_id: pickOptionalString(source.primary_dish_id ?? source.dish_id),
      source_recipe_id: pickOptionalString(source.source_recipe_id),
      source_kitchen_id: pickOptionalString(source.source_kitchen_id),
      author_chef_id: pickOptionalString(source.author_chef_id),
      author_user_id: pickOptionalString(source.author_user_id),
      publication_status:
        source.publication_status !== undefined
          ? pickEnum(source.publication_status, PUBLICATION_VALUES, 'unpublished')
          : undefined,
      published_at: (source.published_at as FirebaseTimestamp | undefined) ?? undefined,
      published_by: pickOptionalString(source.published_by),
      published_summary: normalizePublishedRecipeSummary(source.published_summary),
    }),
  }
}
