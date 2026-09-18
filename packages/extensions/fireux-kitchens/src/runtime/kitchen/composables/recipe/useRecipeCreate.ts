import {
  validateRecipePreparation,
  type RecipePreparation,
} from '../../models/recipe-preparation'
import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useTranslationSeed } from 'fireux-translation/runtime/useTranslationSeed'
import { computed, unref, type Ref } from 'vue'
import {
  RecipeStorage,
  type RecipeCreateInput,
  type Recipe as RecipeDoc,
} from '../../utils/recipe.ts'
import { resolveKitchenScopeCollectionPath } from '../../utils/kitchen-collection-path'
import { useKitchenWorkspaceSelection } from '../workspace/useKitchenWorkspaceSelection'

type RecipeCreateDraft = {
  name: string
  description?: string
  preparation?: RecipePreparation
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

const normalizeString = (value: unknown) => String(value ?? '').trim()

async function buildRecipePayload(
  recipeId: string,
  draft: RecipeCreateDraft,
  kitchenId: string,
  seedTranslations: ReturnType<typeof useTranslationSeed>['seedTranslations'],
  options: RecipeCreateOptions
): Promise<{ payload: RecipeCreateInput; failedLanguages: string[] }> {
  const name = normalizeString(draft.name)
  const description = normalizeString(draft.description)
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
      preparation: validateRecipePreparation(draft.preparation),
    },
  }
}

export function useRecipeCreate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { createDocument: create } = useFirestoreCreate({
    databaseId: options.databaseId,
  })
  const db = useFirestore(options.databaseId)
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenWorkspaceSelection()
  const { seedTranslations } = useTranslationSeed()

  const kitchenCollectionPath = computed(
    () =>
      normalizeString(unref(options.kitchenCollectionPath)) ||
      resolveKitchenScopeCollectionPath(appId)
  )

  const createRecipe = async (
    draft: RecipeCreateDraft,
    overrides: { kitchenId?: string } = {},
    createOptions: RecipeCreateOptions = {}
  ): Promise<RecipeCreateResult> => {
    requireWritableData()
    const kitchenId = normalizeString(overrides.kitchenId || selectedId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    const name = normalizeString(draft.name)
    if (!name) throw new Error('Recipe name is required')

    const recipeId = normalizeSlug(name)
    if (!recipeId) throw new Error('Unable to resolve recipe id')

    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/${RecipeStorage.collection}`
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

    await create(collectionPath, payload as RecipeDoc, {
      id: recipeId,
      app: true,
      creator: true,
    })

    return { id: recipeId, failedLanguages }
  }

  return { createRecipe }
}
