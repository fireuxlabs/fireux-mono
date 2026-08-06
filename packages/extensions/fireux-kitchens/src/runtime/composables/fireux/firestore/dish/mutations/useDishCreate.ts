// Concurrent edit — 2026-07-22 00:37 CEST — Dish media ownership: keep raw image URLs out of client Dish creation.
import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { computed, unref, type Ref } from 'vue'
import {
  DishStorage,
  normalizeDishDealFlag,
  normalizeDishItemKind,
  type Dish,
  type DishCreateInput,
} from '../../../../../models/kitchen/dish.model'
import { resolveKitchenScopeCollectionPath } from '../../kitchen/utils/paths/useKitchenChildCollection'
import { useKitchenConsoleSelection } from '../../../console/kitchen/core/useKitchenConsoleSelection'

type DishCreateDraft = {
  name: string
  description?: string
  item_kind?: string
  is_deal?: boolean
}

export type DishCreateResult = {
  id: string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

function buildDishPayload(
  dishId: string,
  draft: DishCreateDraft,
  kitchenId: string
): DishCreateInput {
  const name = normalizeString(draft.name)
  const description = normalizeString(draft.description)
  return {
    id: dishId,
    name,
    slug: dishId,
    description,
    item_kind: normalizeDishItemKind(draft.item_kind),
    is_deal: normalizeDishDealFlag(draft.is_deal),
    image: '',
    kitchen_id: kitchenId,
  }
}

export function useDishCreate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const create = useFirestoreClientCreate()
  const db = useFirestore(options.databaseId)
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenConsoleSelection()

  const kitchenCollectionPath = computed(() =>
    normalizeString(unref(options.kitchenCollectionPath)) ||
    resolveKitchenScopeCollectionPath(appId)
  )

  const createDish = async (
    draft: DishCreateDraft,
    overrides: { kitchenId?: string } = {}
  ): Promise<DishCreateResult> => {
    requireWritableData()
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

    const payload = buildDishPayload(
      dishId,
      draft,
      kitchenId
    )

    await create(
      defineRuntimeClientCreateTarget(
        'project.kitchen-dishes',
        collectionPath
      ),
      payload as Dish,
      { id: dishId, app: true, creator: true }
    )

    return { id: dishId }
  }

  return { createDish }
}
