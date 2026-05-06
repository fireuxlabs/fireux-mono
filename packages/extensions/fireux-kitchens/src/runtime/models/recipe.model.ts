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
 * - Recipe exists because a kitchen owns and operates it.
 * - Keep recipe scoped even when it references reusable root entities like Ingredient.
 * - If that changes later, update the models README first, then this file.
 */

export type WorkflowStatus = 'draft' | 'active' | 'archived'
export type RecipeVisibility = 'private' | 'team' | 'shared' | 'public'
export type ProtectionLevel = 'standard' | 'confidential' | 'secret'
export type RecipeType = 'base' | 'component' | 'prep' | 'service'
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

const DEFAULT_POLICY: RecipeAccessPolicy = {
  metadata_read_roles: ['kitchen_admin', 'kitchen_editor', 'author_chef'],
  method_read_roles: ['kitchen_admin', 'kitchen_editor', 'author_chef'],
  edit_roles: ['kitchen_admin', 'kitchen_editor', 'author_chef'],
  publish_roles: ['kitchen_admin'],
  export_roles: ['kitchen_admin'],
  duplicate_scope: 'same_kitchen_only',
  shared_kitchen_ids: [],
}

export const RecipeModel = {
  id: '' as string,

  name: '' as string,
  names: undefined as Record<string, string> | undefined,
  slug: undefined as string | undefined,
  recipe_type: 'service' as RecipeType,

  kitchen_id: '' as string,

  author_chef_id: '' as string,
  author_user_id: '' as string,

  workflow_status: 'draft' as WorkflowStatus,
  archived_at: undefined as FirebaseTimestamp | undefined,
  archived_by: undefined as string | undefined,

  visibility: 'team' as RecipeVisibility,

  protection_level: 'standard' as ProtectionLevel,
  access_policy: DEFAULT_POLICY as RecipeAccessPolicy,

  description: '' as string,
  descriptions: undefined as Record<string, string> | undefined,
  ingredient_lines: [] as RecipeIngredientLine[],
  steps: [] as RecipeStep[],
  tags: [] as string[],
  notes: undefined as string | undefined,
  cuisine_types: [] as string[],
  dietary_flags: [] as string[],
  difficulty_level: undefined as DifficultyLevel | undefined,

  yield_qty: 0 as number,
  yield_unit: 'portion' as string,
  prep_minutes: 0 as number,
  cook_minutes: 0 as number,

  primary_dish_id: undefined as string | undefined,
  source_recipe_id: undefined as string | undefined,
  source_kitchen_id: undefined as string | undefined,

  publication_status: 'unpublished' as PublicationStatus,
  published_at: undefined as FirebaseTimestamp | undefined,
  published_by: undefined as string | undefined,
  published_summary: undefined as PublishedRecipeSummary | undefined,

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

export type Recipe = {
  [K in keyof typeof RecipeModel]: (typeof RecipeModel)[K]
}

export type RecipeCreateInput = Omit<Recipe, 'created' | 'updated'>
export type RecipeUpdateInput = Partial<Omit<Recipe, 'id' | 'created' | 'updated' | 'kitchen_id'>>

const WORKFLOW_VALUES = new Set<WorkflowStatus>(['draft', 'active', 'archived'])
const VISIBILITY_VALUES = new Set<RecipeVisibility>(['private', 'team', 'shared', 'public'])
const PROTECTION_VALUES = new Set<ProtectionLevel>(['standard', 'confidential', 'secret'])
const RECIPE_TYPE_VALUES = new Set<RecipeType>(['base', 'component', 'prep', 'service'])
const PUBLICATION_VALUES = new Set<PublicationStatus>(['unpublished', 'published', 'withdrawn'])
const DIFFICULTY_VALUES = new Set<DifficultyLevel>(['easy', 'moderate', 'advanced'])

const POLICY_ROLE_VALUES = new Set<RecipePolicyRole>([
  'kitchen_admin',
  'kitchen_editor',
  'author_chef',
  'team_member',
  'app_admin',
])

const DUPLICATE_SCOPE_VALUES = new Set<DuplicateScope>([
  'blocked',
  'same_kitchen_only',
  'approved_shared_import',
])

const pickString = (value: unknown) => String(value || '').trim()
const pickOptionalString = (value: unknown) => {
  const resolved = pickString(value)
  return resolved || undefined
}
const pickNumber = (value: unknown) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}
const pickStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map((entry) => pickString(entry)).filter(Boolean)
    : []

function pickEnum<T extends string>(value: unknown, allowed: Set<T>, fallback: T): T {
  const resolved = pickString(value) as T
  return allowed.has(resolved) ? resolved : fallback
}

export function createDefaultRecipeAccessPolicy(): RecipeAccessPolicy {
  return {
    metadata_read_roles: [...DEFAULT_POLICY.metadata_read_roles],
    method_read_roles: [...DEFAULT_POLICY.method_read_roles],
    edit_roles: [...DEFAULT_POLICY.edit_roles],
    publish_roles: [...DEFAULT_POLICY.publish_roles],
    export_roles: [...DEFAULT_POLICY.export_roles],
    duplicate_scope: DEFAULT_POLICY.duplicate_scope,
    shared_kitchen_ids: [...(DEFAULT_POLICY.shared_kitchen_ids ?? [])],
  }
}

function normalizePolicyRoles(value: unknown, fallback: RecipePolicyRole[]) {
  const roles = pickStringArray(value).filter((role): role is RecipePolicyRole =>
    POLICY_ROLE_VALUES.has(role as RecipePolicyRole)
  )
  return roles.length ? roles : [...fallback]
}

export function normalizeRecipeAccessPolicy(value: unknown): RecipeAccessPolicy {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const fallback = createDefaultRecipeAccessPolicy()

  return {
    metadata_read_roles: normalizePolicyRoles(source.metadata_read_roles, fallback.metadata_read_roles),
    method_read_roles: normalizePolicyRoles(source.method_read_roles, fallback.method_read_roles),
    edit_roles: normalizePolicyRoles(source.edit_roles, fallback.edit_roles),
    publish_roles: normalizePolicyRoles(source.publish_roles, fallback.publish_roles),
    export_roles: normalizePolicyRoles(source.export_roles, fallback.export_roles),
    duplicate_scope: pickEnum(source.duplicate_scope, DUPLICATE_SCOPE_VALUES, fallback.duplicate_scope),
    shared_kitchen_ids: pickStringArray(source.shared_kitchen_ids),
  }
}

export function normalizeRecipeIngredientLines(value: unknown): RecipeIngredientLine[] {
  if (!Array.isArray(value)) return []

  return value.map((entry, index) => {
    const source = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {}
    return {
      id: pickString(source.id) || `ingredient-line-${index + 1}`,
      ingredient_id: pickOptionalString(source.ingredient_id),
      ingredient_name: pickString(source.ingredient_name),
      quantity: pickNumber(source.quantity),
      unit: pickString(source.unit),
      prep_note: pickOptionalString(source.prep_note),
    }
  })
}

export function normalizeRecipeSteps(value: unknown): RecipeStep[] {
  if (!Array.isArray(value)) return []

  return value.map((entry, index) => {
    const source = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {}
    return {
      id: pickString(source.id) || `recipe-step-${index + 1}`,
      order: pickNumber(source.order) || index + 1,
      title: pickOptionalString(source.title),
      instruction: pickString(source.instruction),
      minutes: source.minutes === undefined || source.minutes === null
        ? undefined
        : pickNumber(source.minutes),
    }
  })
}

export function normalizePublishedRecipeSummary(value: unknown): PublishedRecipeSummary | undefined {
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
    difficulty_level: source.difficulty_level === undefined
      ? undefined
      : pickEnum(source.difficulty_level, DIFFICULTY_VALUES, 'moderate'),
  }
}

export function normalizeRecipe(value: unknown): Recipe {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const created = source.created && typeof source.created === 'object'
    ? (source.created as Recipe['created'])
    : RecipeModel.created
  const updated = source.updated && typeof source.updated === 'object'
    ? (source.updated as Recipe['updated'])
    : RecipeModel.updated
  const authorUserId =
    pickString(source.author_user_id) ||
    pickString((created as Record<string, unknown> | undefined)?.by)
  const authorChefId = pickString(source.author_chef_id) || authorUserId
  const protectionLevel = pickEnum(source.protection_level, PROTECTION_VALUES, 'standard')
  const requestedVisibility = pickEnum(source.visibility, VISIBILITY_VALUES, 'team')
  const visibility = protectionLevel === 'secret' && requestedVisibility === 'public'
    ? 'team'
    : requestedVisibility
  const requestedPublicationStatus = pickEnum(
    source.publication_status,
    PUBLICATION_VALUES,
    'unpublished'
  )
  const publicationStatus = protectionLevel === 'secret' && requestedPublicationStatus === 'published'
    ? 'unpublished'
    : requestedPublicationStatus

  return {
    ...RecipeModel,
    id: pickString(source.id),
    name: pickString(source.name) || pickString(source.title),
    slug: pickOptionalString(source.slug),
    recipe_type: pickEnum(source.recipe_type, RECIPE_TYPE_VALUES, 'service'),
    kitchen_id: pickString(source.kitchen_id),
    author_chef_id: authorChefId,
    author_user_id: authorUserId,
    workflow_status: pickEnum(source.workflow_status ?? source.status, WORKFLOW_VALUES, 'draft'),
    archived_at: (source.archived_at as FirebaseTimestamp | undefined) ?? undefined,
    archived_by: pickOptionalString(source.archived_by),
    visibility,
    protection_level: protectionLevel,
    access_policy: normalizeRecipeAccessPolicy(source.access_policy),
    description: pickString(source.description),
    ingredient_lines: normalizeRecipeIngredientLines(source.ingredient_lines),
    steps: normalizeRecipeSteps(source.steps),
    tags: pickStringArray(source.tags),
    notes: pickOptionalString(source.notes),
    cuisine_types: pickStringArray(source.cuisine_types ?? source.cuisine_type),
    dietary_flags: pickStringArray(source.dietary_flags ?? source.dietary_restrictions),
    difficulty_level: source.difficulty_level === undefined
      ? undefined
      : pickEnum(source.difficulty_level, DIFFICULTY_VALUES, 'moderate'),
    yield_qty: pickNumber(source.yield_qty),
    yield_unit: pickString(source.yield_unit) || 'portion',
    prep_minutes: pickNumber(source.prep_minutes),
    cook_minutes: pickNumber(source.cook_minutes),
    primary_dish_id: pickOptionalString(source.primary_dish_id ?? source.dish_id),
    source_recipe_id: pickOptionalString(source.source_recipe_id),
    source_kitchen_id: pickOptionalString(source.source_kitchen_id),
    publication_status: publicationStatus,
    published_at: (source.published_at as FirebaseTimestamp | undefined) ?? undefined,
    published_by: pickOptionalString(source.published_by),
    published_summary: normalizePublishedRecipeSummary(source.published_summary),
    created,
    updated,
  }
}
