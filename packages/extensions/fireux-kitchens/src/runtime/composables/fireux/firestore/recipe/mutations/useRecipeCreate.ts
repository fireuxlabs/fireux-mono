import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { computed, unref, type Ref } from 'vue'
import {
  RecipeModel,
  type RecipeCreateInput,
  type Recipe as RecipeDoc,
} from '../../../../../models/recipe.model'
import { resolveKitchenConsoleCollectionPath } from '../../../app/kitchen-console/shared'
import { useKitchenSelection } from '../../../app/kitchen-console/useKitchenSelection'

type RecipeCreateDraft = {
  name: string
  description?: string
}

const trim = (value: unknown) => String(value || '').trim()

function buildRecipePayload(
  draft: RecipeCreateDraft,
  kitchenId: string
): RecipeCreateInput {
  const name = trim(draft.name)

  return {
    ...RecipeModel,
    name,
    slug: normalizeSlug(name),
    description: trim(draft.description),
    kitchen_id: kitchenId,
    created: RecipeModel.created,
    updated: RecipeModel.updated,
  }
}

export function useRecipeCreate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { createDocument } = useFirestoreCreate({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenSelection()

  const kitchenCollectionPath = computed(() =>
    trim(unref(options.kitchenCollectionPath)) ||
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

    const payload = buildRecipePayload(draft, kitchenId)
    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/recipes`

    return createDocument<RecipeDoc>(collectionPath, payload as RecipeDoc, {
      app: true,
      creator: true,
    })
  }

  return { createRecipe }
}
