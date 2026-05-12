import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useTranslationSeed } from 'fireux-translation/runtime/useTranslationSeed'
import { computed, unref, type Ref } from 'vue'
import {
  type RecipeCreateInput,
  type Recipe as RecipeDoc,
} from '../../../../../models/recipe.model'
import { resolveKitchenConsoleCollectionPath } from '../../../console/kitchen/collections/useKitchenChildCollection'
import { useKitchenSelection } from '../../../app/kitchen-console/useKitchenSelection'

type RecipeCreateDraft = {
  name: string
  description?: string
  names?: unknown
  descriptions?: unknown
}

type RecipeCreateOptions = {
  languageCodes?: string[]
  sourceLanguage?: string
  translate?: boolean
}

export type RecipeCreateResult = {
  id: string
  failedLanguages: string[]
}

const trim = (value: unknown) => String(value || '').trim()

async function buildRecipePayload(
  recipeId: string,
  draft: RecipeCreateDraft,
  kitchenId: string,
  seedTranslations: ReturnType<typeof useTranslationSeed>['seedTranslations'],
  options: RecipeCreateOptions
): Promise<{ payload: RecipeCreateInput; failedLanguages: string[] }> {
  const name = trim(draft.name)
  const description = trim(draft.description)
  const nameSeed = await seedTranslations({
    text: name,
    sourceLanguage: options.sourceLanguage,
    languageCodes: options.languageCodes,
    existingText: draft.names,
    translate: options.translate,
  })
  const descriptionSeed = description
    ? await seedTranslations({
        text: description,
        sourceLanguage: nameSeed.sourceLanguage,
        languageCodes: options.languageCodes,
        existingText: draft.descriptions,
        translate: options.translate,
      })
    : null

  return {
    failedLanguages: Array.from(
      new Set([
        ...nameSeed.failedLanguages,
        ...(descriptionSeed?.failedLanguages ?? []),
      ])
    ),
    payload: {
      id: recipeId,
      name,
      slug: recipeId,
      description,
      source_language: nameSeed.sourceLanguage,
      names: nameSeed.text,
      descriptions: descriptionSeed?.text ?? {},
      kitchen_id: kitchenId,
    },
  }
}

export function useRecipeCreate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { setDocument } = useFirestoreCreate({ databaseId: options.databaseId })
  const db = useFirestore(options.databaseId)
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenSelection()
  const { seedTranslations } = useTranslationSeed()

  const kitchenCollectionPath = computed(() =>
    trim(unref(options.kitchenCollectionPath)) ||
    resolveKitchenConsoleCollectionPath(appId)
  )

  const createRecipe = async (
    draft: RecipeCreateDraft,
    overrides: { kitchenId?: string } = {},
    createOptions: RecipeCreateOptions = {}
  ): Promise<RecipeCreateResult> => {
    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    const name = trim(draft.name)
    if (!name) throw new Error('Recipe name is required')

    const recipeId = normalizeSlug(name)
    if (!recipeId) throw new Error('Unable to resolve recipe id')

    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/recipes`
    const recipeRef = doc(db, collectionPath, recipeId)
    const recipeSnap = await getDoc(recipeRef)
    if (recipeSnap.exists()) {
      throw new Error('Recipe already exists')
    }

    const { payload, failedLanguages } = await buildRecipePayload(
      recipeId,
      draft,
      kitchenId,
      seedTranslations,
      createOptions
    )

    await setDocument<RecipeDoc>(collectionPath, recipeId, payload as RecipeDoc, {
      app: true,
      creator: true,
    })

    return { id: recipeId, failedLanguages }
  }

  return { createRecipe }
}
