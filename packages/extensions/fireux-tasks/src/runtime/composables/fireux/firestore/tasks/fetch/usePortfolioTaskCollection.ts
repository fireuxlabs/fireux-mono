import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  useRuntimePortfolio,
  useRuntimePortfolioPath,
} from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import type { ReadOnlyTask } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios'
import type { Task } from '../../../../../models/task.model'

const normalize = (value: unknown) => String(value || '').trim()

const toTask = (entry: ReadOnlyTask): Task => ({
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

export function usePortfolioTaskCollection(runtimePortfolio = useRuntimePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<Task[] | undefined> | null>
  const collectionPath = useRuntimePortfolioPath(runtimePortfolio, 'tasks')

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath || runtimePortfolio.isReadOnly.value) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Task>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<Task[]>(() => {
    if (runtimePortfolio.isReadOnly.value) {
      return (runtimePortfolio.scenario.value?.tasks ?? []).map((entry) => toTask(entry))
    }
    return sourceRef.value?.value ?? []
  })

  return {
    collectionPath,
    collection,
  }
}
