import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { TaskStorage, type Task } from '../../../../../models/task.model'

export function usePortfolioTaskCollection(runtimePortfolio = useActivePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<Task[] | undefined> | null>
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    TaskStorage.collection
  )

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Task>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<Task[]>(() => sourceRef.value?.value ?? [])
  const { byId: task } = useCollectionById(collection)

  return {
    collectionPath,
    collection,
    task,
  }
}
