import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useTranslationSeed } from 'fireux-translation/runtime/useTranslationSeed'
import { computed, unref, type Ref } from 'vue'
import {
  DishStorage,
  type Dish,
  type DishCreateInput,
} from '../../../../../models/dish.model'
import { resolveKitchenConsoleCollectionPath } from '../../../console/kitchen/operations/collections/useKitchenChildCollection'
import { useKitchenSelection } from '../../../console/kitchen/useKitchenSelection'

type DishCreateDraft = {
  name: string
  description?: string
  names?: unknown
  descriptions?: unknown
}

type DishCreateOptions = {
  languageCodes?: string[]
  sourceLanguage?: string
  translate?: boolean
}

export type DishCreateResult = {
  id: string
  failedLanguages: string[]
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

async function buildDishPayload(
  dishId: string,
  draft: DishCreateDraft,
  kitchenId: string,
  seedTranslations: ReturnType<typeof useTranslationSeed>['seedTranslations'],
  options: DishCreateOptions
): Promise<{ payload: DishCreateInput; failedLanguages: string[] }> {
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
      id: dishId,
      name,
      slug: dishId,
      description,
      names: nameSeed.text,
      descriptions: descriptionSeed?.text ?? {},
      kitchen_id: kitchenId,
    },
  }
}

export function useDishCreate(
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
    normalizeString(unref(options.kitchenCollectionPath)) ||
    resolveKitchenConsoleCollectionPath(appId)
  )

  const createDish = async (
    draft: DishCreateDraft,
    overrides: { kitchenId?: string } = {},
    createOptions: DishCreateOptions = {}
  ): Promise<DishCreateResult> => {
    const kitchenId = normalizeString(overrides.kitchenId || selectedId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    const name = normalizeString(draft.name)
    if (!name) throw new Error('Dish name is required')

    const dishId = normalizeSlug(name)
    if (!dishId) throw new Error('Unable to resolve dish id')

    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/${DishStorage.collection}`
    const dishRef = doc(db, collectionPath, dishId)
    const dishSnap = await getDoc(dishRef)
    if (dishSnap.exists()) {
      throw new Error('Dish already exists')
    }

    const { payload, failedLanguages } = await buildDishPayload(
      dishId,
      draft,
      kitchenId,
      seedTranslations,
      createOptions
    )

    await setDocument<Dish>(collectionPath, dishId, payload as Dish, {
      app: true,
      creator: true,
    })

    return { id: dishId, failedLanguages }
  }

  return { createDish }
}
