import { computed } from 'vue'
import type { App } from '../../../../../../models/core/app.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type AppCollectionDoc = Partial<App> & { id?: string }

export function useAppCollection(collectionPath: string | { value?: string } = 'apps') {
  const { firestoreFetchCollection } = useFirestoreRead()
  const path =
    typeof collectionPath === 'string'
      ? collectionPath
      : String(collectionPath?.value || 'apps').trim() || 'apps'
  const source = firestoreFetchCollection<AppCollectionDoc>(path)
  const apps = computed(() => source.value ?? [])
  const count = computed(() => apps.value?.length ?? 0)

  return { apps, count }
}
