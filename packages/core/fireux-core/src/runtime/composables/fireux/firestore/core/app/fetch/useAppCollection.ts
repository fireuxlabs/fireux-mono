import { computed } from 'vue'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import type { App } from '../../../../../../models/core/app.model'

export function useAppCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<App>('apps')
  const apps = computed(() => source.value ?? [])
  return { apps }
}
