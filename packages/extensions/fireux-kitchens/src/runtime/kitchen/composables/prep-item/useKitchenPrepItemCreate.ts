import { doc, getDoc } from 'firebase/firestore'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useTranslationSeed } from 'fireux-translation/runtime/useTranslationSeed'
import { computed, unref, type Ref } from 'vue'
import {
  KitchenPrepItemStorage,
  normalizeKitchenPrepItemInput,
  normalizeKitchenPrepItemUnit,
  type KitchenPrepItem,
  type KitchenPrepItemCreateInput,
  type KitchenPrepItemInput,
  type KitchenPrepItemUnit,
} from '../../utils/prep-item.ts'
import { useKitchenWorkspaceSelection } from '../workspace/useKitchenWorkspaceSelection'
import { resolveKitchenScopeCollectionPath } from '../firestore/useKitchenChildCollection'

type KitchenPrepItemCreateDraft = {
  name: string
  description?: string
  station?: string
  inputs?: KitchenPrepItemInput[]
  recipe_id?: string
  yield?: { quantity?: number; unit?: KitchenPrepItemUnit }
  method?: string[]
  names?: unknown
  descriptions?: unknown
}

type KitchenPrepItemCreateOptions = {
  languageCodes?: string[]
  sourceLanguage?: string
  translate?: boolean
}

const trim = (value: unknown) => String(value ?? '').trim()
const quantity = (value: unknown) => {
  const next = Number(value)
  return Number.isFinite(next) && next >= 0 ? next : 0
}

export function useKitchenPrepItemCreate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { createDocument: create } = useFirestoreCreate()
  const db = useFirestore(options.databaseId)
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenWorkspaceSelection()
  const { seedTranslations } = useTranslationSeed()
  const kitchenCollectionPath = computed(
    () =>
      trim(unref(options.kitchenCollectionPath)) ||
      resolveKitchenScopeCollectionPath(appId)
  )

  const createPrepItem = async (
    draft: KitchenPrepItemCreateDraft,
    overrides: { kitchenId?: string } = {},
    createOptions: KitchenPrepItemCreateOptions = {}
  ) => {
    requireWritableData()
    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    const name = trim(draft.name)
    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!name) throw new Error('Prep Item name is required')
    const prepItemId = normalizeSlug(name)
    if (!prepItemId) throw new Error('Unable to resolve Prep Item id')

    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/${KitchenPrepItemStorage.collection}`
    if ((await getDoc(doc(db, collectionPath, prepItemId))).exists()) {
      throw new Error('Prep Item already exists')
    }

    const description = trim(draft.description)
    const nameSeed = await seedTranslations({
      text: name,
      sourceLanguage: createOptions.sourceLanguage,
      languageCodes: createOptions.languageCodes,
      existingText: draft.names,
      translate: createOptions.translate,
    })
    const descriptionSeed = description
      ? await seedTranslations({
          text: description,
          sourceLanguage: nameSeed.sourceLanguage,
          languageCodes: createOptions.languageCodes,
          existingText: draft.descriptions,
          translate: createOptions.translate,
        })
      : null
    const payload: KitchenPrepItemCreateInput = {
      kitchen_id: kitchenId,
      name,
      slug: prepItemId,
      description,
      source_language: nameSeed.sourceLanguage,
      names: nameSeed.text,
      descriptions: descriptionSeed?.text ?? {},
      station: trim(draft.station),
      inputs: (draft.inputs ?? []).map(normalizeKitchenPrepItemInput),
      recipe_id: trim(draft.recipe_id),
      yield: {
        quantity: quantity(draft.yield?.quantity),
        unit: normalizeKitchenPrepItemUnit(draft.yield?.unit),
      },
      method: (draft.method ?? []).map(trim).filter(Boolean),
    }
    await create(collectionPath, payload as KitchenPrepItem, {
      id: prepItemId,
      app: true,
      creator: true,
    })

    return {
      id: prepItemId,
      failedLanguages: Array.from(
        new Set([
          ...nameSeed.failedLanguages,
          ...(descriptionSeed?.failedLanguages ?? []),
        ])
      ),
    }
  }

  return { createPrepItem }
}
