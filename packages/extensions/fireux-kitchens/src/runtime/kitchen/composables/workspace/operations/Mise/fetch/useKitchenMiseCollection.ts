import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed, unref, type Ref } from 'vue'
import {
  KitchenMiseTaskStorage,
  normalizeKitchenMiseTask,
  type KitchenMiseTask,
} from '../../../../../models/mise.model.ts'
import { resolveKitchenChildCollectionBasePath } from '../../../../firestore/utils/paths/useKitchenChildCollection'

const resolveMisePath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/${KitchenMiseTaskStorage.collection}`

type UseKitchenMiseCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenMiseCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseKitchenMiseCollectionOptions = {}
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
      collectionName: KitchenMiseTaskStorage.collection,
      appId,
    })
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? resolveMisePath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )
  const collectionRef =
    firestoreFetchCollection<Record<string, unknown>>(collectionPath)

  const miseTasks = computed<KitchenMiseTask[]>(() =>
    (collectionRef.value ?? []).map((entry) => normalizeKitchenMiseTask(entry))
  )
  const count = computed(() => miseTasks.value.length)
  const pending = computed(() => collectionRef.pending.value)
  const error = computed(() => collectionRef.error.value)
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(collectionPath.value)),
    count,
    pending,
    error,
  })
  const { byId: miseTask } = useCollectionById(miseTasks)

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    miseTasks,
    miseTask,
    count,
    pending,
    error,
    outcome,
  }
}
