import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref } from 'vue'
import { computed, toValue, unref, type MaybeRefOrGetter } from 'vue'
import { DishStorage, normalizeDish, type Dish } from '../../../../models/dish.model.ts'
import { resolveKitchenChildCollectionBasePath } from '../../utils/paths/useKitchenChildCollection'

const resolveDishesPath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/${DishStorage.collection}`

type UseKitchenDishCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
  recordProvider?: {
    active: MaybeRefOrGetter<boolean>
    records: MaybeRefOrGetter<readonly unknown[] | undefined>
    pending: MaybeRefOrGetter<boolean>
    error: MaybeRefOrGetter<unknown | undefined>
    collectionPath: MaybeRefOrGetter<string>
  }
}

export function useKitchenDishCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseKitchenDishCollectionOptions = {}
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
  const usesRecordProvider = computed(() =>
    Boolean(options.recordProvider && toValue(options.recordProvider.active))
  )
  const remoteCollectionPath = computed(() =>
    usesRecordProvider.value ? '' : collectionPath.value
  )
  const collectionRef = firestoreFetchCollection<Record<string, unknown>>(
    remoteCollectionPath
  )
  const resolvedCollectionPath = computed(() =>
    usesRecordProvider.value
      ? String(toValue(options.recordProvider?.collectionPath) || '').trim()
      : collectionPath.value
  )
  const rawRecords = computed<readonly unknown[]>(() =>
    usesRecordProvider.value
      ? toValue(options.recordProvider?.records) ?? []
      : collectionRef.value ?? []
  )

  const dishes = computed<Dish[]>(() =>
    rawRecords.value.map(entry => normalizeDish(entry))
  )
  const count = computed(() => dishes.value.length)
  const pending = computed(() =>
    usesRecordProvider.value
      ? Boolean(toValue(options.recordProvider?.pending))
      : collectionRef.pending.value
  )
  const error = computed(() =>
    usesRecordProvider.value
      ? toValue(options.recordProvider?.error)
      : collectionRef.error.value
  )
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(resolvedCollectionPath.value)),
    count,
    pending,
    error,
  })

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath: resolvedCollectionPath,
    dishes,
    count,
    pending,
    error,
    outcome,
  }
}
