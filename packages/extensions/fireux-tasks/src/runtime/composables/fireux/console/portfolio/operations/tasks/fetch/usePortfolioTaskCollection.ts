import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import type { DemoTask } from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/demo-scenarios'
import { TaskStorage, type Task } from '../../../../../../../models/task.model'

const normalize = (value: unknown) => String(value || '').trim()

const toTask = (entry: DemoTask): Task => ({
  id: normalize(entry.id),
  portfolio_id: normalize(entry.portfolio_id),
  title: normalize(entry.title),
  description: '',
  status: entry.status,
  source: entry.source,
  due_date: normalize(entry.due_date),
  linked_entity_type: normalize(entry.linked_entity_type),
  linked_entity_id: normalize(entry.linked_entity_id),
  created: { at: {} as any, by: undefined, app_id: undefined },
  updated: { at: {} as any, by: undefined },
})

export function usePortfolioTaskCollection(runtimePortfolio = useActivePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<Task[] | undefined> | null>
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    TaskStorage.collection
  )

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath || runtimePortfolio.isDemo.value) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Task>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<Task[]>(() => {
    if (runtimePortfolio.isDemo.value) {
      return (runtimePortfolio.scenario.value?.tasks ?? []).map((entry) => toTask(entry))
    }
    return sourceRef.value?.value ?? []
  })
  const { byId: task } = useCollectionById(collection)

  return {
    collectionPath,
    collection,
    task,
  }
}
