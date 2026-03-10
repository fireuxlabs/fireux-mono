import { computed } from 'vue'
import type { AppModel } from '../../../../../../models/core/app.model'
import type { FireuxSystemAppRegistryDoc } from '../../../../../../models/system/app.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type AppCollectionDoc = Partial<AppModel> & Partial<FireuxSystemAppRegistryDoc> & { id?: string }

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
