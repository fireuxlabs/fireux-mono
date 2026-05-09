import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, unref, watch } from 'vue'
import { normalizeDish, type Dish } from '../../../../../models/dish.model'
import { resolveKitchenChildCollectionBasePath } from '../../../app/kitchen-console/shared'

const resolveDishesPath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/dishes`

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
      collectionName: 'dishes',
      appId,
    })
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? resolveDishesPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )
  const databaseIdKey = computed(() => String(unref(options.databaseId) || '').trim())

  const collectionRef = shallowRef(null) as ShallowRef<Ref<Record<string, unknown>[] | undefined> | null>

  watch(
    [collectionPath, databaseIdKey],
    (next) => {
      const [nextPath] = next
      collectionRef.value = nextPath ? firestoreFetchCollection<Record<string, unknown>>(nextPath) : null
    },
    { immediate: true }
  )

  const dishes = computed<Dish[]>(() =>
    (collectionRef.value?.value ?? []).map((entry) => normalizeDish(entry))
  )
  const pending = computed(
    () => Boolean(collectionPath.value) && collectionRef.value?.value === undefined
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
