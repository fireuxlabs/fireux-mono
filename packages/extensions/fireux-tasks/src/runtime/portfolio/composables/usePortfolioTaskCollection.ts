import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { TaskStorage, type Task } from '../models/task.model'

export function usePortfolioTaskCollection(
  runtimePortfolio = useActivePortfolio()
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    TaskStorage.collection
  )

  const source = firestoreFetchCollection<Task>(collectionPath)

  const collection = computed<Task[]>(() =>
    outcome.value === 'ready' ? (source.value ?? []) : []
  )
  const { byId: task } = useCollectionById(collection)

  const count = computed(() => collection.value.length)
  const pending = source.pending
  const error = source.error
  const { outcome: sourceOutcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(collectionPath.value)),
    count: computed(() => (source.value ?? []).length),
    pending,
    error,
  })

  const outcome = computed(() =>
    runtimePortfolio.targetOutcome.value !== 'ready'
      ? runtimePortfolio.targetOutcome.value
      : sourceOutcome.value
  )

  return {
    count,
    pending,
    error,
    outcome,
    collectionPath,
    collection,
    task,
  }
}
