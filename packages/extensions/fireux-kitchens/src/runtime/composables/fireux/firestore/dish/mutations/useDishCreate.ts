import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
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
    kitchen_id: kitchenId,
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

  const kitchenCollectionPath = computed(() =>
    normalizeString(unref(options.kitchenCollectionPath)) ||
    resolveKitchenConsoleCollectionPath(appId)
  )

  const createDish = async (
    draft: DishCreateDraft,
    overrides: { kitchenId?: string } = {}
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

    const payload = buildDishPayload(
      dishId,
      draft,
      kitchenId
    )

    await setDocument<Dish>(collectionPath, dishId, payload as Dish, {
      app: true,
      creator: true,
    })

    return { id: dishId }
  }

  return { createDish }
}
