import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useCurrentUser } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { computed, unref, type Ref } from 'vue'
import {
  RecipeModel,
  createDefaultRecipeAccessPolicy,
  normalizePublishedRecipeSummary,
  normalizeRecipeIngredientLines,
  normalizeRecipeSteps,
  type DifficultyLevel,
  type ProtectionLevel,
  type PublicationStatus,
  type RecipeCreateInput,
  type Recipe as RecipeDoc,
  type RecipeType,
  type RecipeVisibility,
  type WorkflowStatus,
} from '../../../../../../models/recipe.model'
import { useKitchenSelection } from '../../../../app/kitchen-console/useKitchenSelection'
import { resolveKitchenConsoleCollectionPath } from '../../../../app/kitchen-console/shared'

type RecipeCreateDraft = Partial<RecipeCreateInput> & {
  name: string
}

const trim = (value: unknown) => String(value || '').trim()

const optional = (value: unknown) => {
  const resolved = trim(value)
  return resolved || undefined
}

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => {
  const resolved = trim(value) as T
  return allowed.includes(resolved) ? resolved : fallback
}

const stringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map((entry) => trim(entry)).filter(Boolean)
    : []

function buildRecipePayload(draft: RecipeCreateDraft, kitchenId: string, userId: string): RecipeCreateInput {
  const protectionLevel = oneOf<ProtectionLevel>(
    draft.protection_level,
    ['standard', 'confidential', 'secret'],
    'standard'
  )
  const requestedVisibility = oneOf<RecipeVisibility>(
    draft.visibility,
    ['private', 'team', 'shared', 'public'],
    'team'
  )
  const visibility = protectionLevel === 'secret' && requestedVisibility === 'public'
    ? 'team'
    : requestedVisibility
  const requestedPublicationStatus = oneOf<PublicationStatus>(
    draft.publication_status,
    ['unpublished', 'published', 'withdrawn'],
    'unpublished'
  )
  const publicationStatus = protectionLevel === 'secret' && requestedPublicationStatus === 'published'
    ? 'unpublished'
    : requestedPublicationStatus
  const publishedSummary = publicationStatus === 'published'
    ? normalizePublishedRecipeSummary(draft.published_summary)
    : undefined

  return {
    ...RecipeModel,
    name: trim(draft.name),
    slug: optional(draft.slug) || (publicationStatus === 'published' ? normalizeSlug(trim(draft.name)) : undefined),
    recipe_type: oneOf<RecipeType>(draft.recipe_type, ['base', 'component', 'prep', 'service'], 'service'),
    kitchen_id: kitchenId,
    author_chef_id: trim(draft.author_chef_id) || userId,
    author_user_id: trim(draft.author_user_id) || userId,
    workflow_status: oneOf<WorkflowStatus>(draft.workflow_status, ['draft', 'active', 'archived'], 'draft'),
    archived_at: undefined,
    archived_by: undefined,
    visibility,
    protection_level: protectionLevel,
    access_policy: draft.access_policy ? { ...createDefaultRecipeAccessPolicy(), ...draft.access_policy } : createDefaultRecipeAccessPolicy(),
    description: trim(draft.description),
    ingredient_lines: normalizeRecipeIngredientLines(draft.ingredient_lines),
    steps: normalizeRecipeSteps(draft.steps),
    tags: stringArray(draft.tags),
    notes: optional(draft.notes),
    cuisine_types: stringArray(draft.cuisine_types),
    dietary_flags: stringArray(draft.dietary_flags),
    difficulty_level: draft.difficulty_level
      ? oneOf<DifficultyLevel>(draft.difficulty_level, ['easy', 'moderate', 'advanced'], 'moderate')
      : undefined,
    yield_qty: toNumber(draft.yield_qty),
    yield_unit: trim(draft.yield_unit) || 'portion',
    prep_minutes: toNumber(draft.prep_minutes),
    cook_minutes: toNumber(draft.cook_minutes),
    primary_dish_id: optional(draft.primary_dish_id),
    source_recipe_id: optional(draft.source_recipe_id),
    source_kitchen_id: optional(draft.source_kitchen_id),
    publication_status: publicationStatus,
    published_at: undefined,
    published_by: undefined,
    published_summary: publishedSummary,
    created: RecipeModel.created,
    updated: RecipeModel.updated,
  }
}

export function useRecipeCreate(options: { kitchenCollectionPath?: string | Ref<string | null | undefined> } = {}) {
  const { createDocument } = useFirestoreCreate()
  const { appId } = useFireUXConfig()
  const currentUser = useCurrentUser()
  const { selectedId } = useKitchenSelection()

  const kitchenCollectionPath = computed(() =>
    String(unref(options.kitchenCollectionPath) || '').trim() ||
    resolveKitchenConsoleCollectionPath(appId)
  )

  const createRecipe = async (
    draft: RecipeCreateDraft,
    overrides: { kitchenId?: string } = {}
  ) => {
    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    const name = trim(draft.name)
    if (!name) throw new Error('Recipe name is required')

    const userId = trim(currentUser.value?.uid)
    if (!userId) throw new Error('User not authenticated')

    const payload = buildRecipePayload(draft, kitchenId, userId)
    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/recipes`

    return createDocument<RecipeDoc>(collectionPath, payload as RecipeDoc, {
      app: true,
      creator: true,
    })
  }

  return { createRecipe }
}
