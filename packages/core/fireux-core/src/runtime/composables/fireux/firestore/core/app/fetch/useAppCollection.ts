import { computed } from 'vue'
import type { AppModel } from '../../../../../../models/core/app.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

export function useAppCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<AppModel>('apps')
  const apps = computed(() => source.value ?? [])

  const count = computed(() => apps.value?.length ?? 0)

  return { apps, count }
}
