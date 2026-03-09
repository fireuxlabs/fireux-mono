import { computed } from 'vue'
import type { AppModel } from '../../../../../../models/core/app.model'
import type { FireuxSystemAppRegistryDoc } from '../../../../../../models/system/app.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type AppCollectionDoc = Partial<AppModel> & Partial<FireuxSystemAppRegistryDoc> & { id?: string }

export function useAppCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<AppCollectionDoc>('apps')
  const apps = computed(() => source.value ?? [])

  const count = computed(() => apps.value?.length ?? 0)

  return { apps, count }
}
