import { computed, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

export function useProjectTestRecords(id: Ref<string>) {
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: computed(() => readRuntimeFirestoreDatabaseId() || ''),
  })
  const records = firestoreFetchCollection<{ id: string; value: string }>(
    computed(() =>
      id.value ? `projects/${id.value}/tests` : ''
    )
  )
  const pending = computed(() => records.value === undefined)
  const error = records.error
  return { records, pending, error }
}
