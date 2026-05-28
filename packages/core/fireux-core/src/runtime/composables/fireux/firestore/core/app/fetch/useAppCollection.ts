import { computed } from 'vue'
import { AppStorage, type App } from '../../../../../../models/core/app.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type AppCollectionDoc = Partial<App> & { id?: string }

export function useAppCollection(
  collectionPath: string | { value?: string } = AppStorage.collection
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const path =
    typeof collectionPath === 'string'
      ? collectionPath
      : String(collectionPath?.value || AppStorage.collection).trim() ||
        AppStorage.collection
  const source = firestoreFetchCollection<AppCollectionDoc>(path)
  const apps = computed(() =>
    (source.value ?? []).filter((app) => String((app as any)?.status || '') !== 'retired')
  )
  const count = computed(() => apps.value?.length ?? 0)

  return { apps, count }
}
