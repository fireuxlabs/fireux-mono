import { computed } from 'vue'
import { useFirestoreRead } from '../../../operations/useFirestoreRead.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

export function useAppCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<App>('apps')
  const apps = computed(() => source.value ?? [])
  return { apps }
}
