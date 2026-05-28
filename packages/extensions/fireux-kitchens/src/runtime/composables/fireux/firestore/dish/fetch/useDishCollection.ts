import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import { DishStorage, normalizeDish, type Dish } from '../../../../../models/dish.model'
import { resolveKitchenChildCollectionBasePath } from '../../../console/kitchen/operations/collections/useKitchenChildCollection'

const resolveDishesPath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/${DishStorage.collection}`

type UseDishCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useDishCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseDishCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()

  const resolvedKitchenId = computed(() =>
    String(unref(kitchenId) || '').trim()
  )
  const kitchenCollectionPath = computed(() =>
    resolveKitchenChildCollectionBasePath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      collectionName: DishStorage.collection,
      appId,
    })
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? resolveDishesPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )
  const collectionRef = firestoreFetchCollection<Record<string, unknown>>(
    collectionPath
  )

  const dishes = computed<Dish[]>(() =>
    (collectionRef.value ?? []).map((entry) => normalizeDish(entry))
  )
  const pending = computed(
    () => Boolean(collectionPath.value) && collectionRef.value === undefined
  )

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    dishes,
    count: computed(() => dishes.value.length),
    pending,
  }
}
