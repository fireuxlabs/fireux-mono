import { computed, unref, type MaybeRef } from 'vue'
import { AppStorage, type App } from '../../../models/app.model.ts'
import { useFirestoreCollectionState } from '../../../../composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from '../../../../composables/fireux/firestore/operations/useFirestoreRead'

type AppCollectionDoc = Partial<App> & { id?: string }

export function useAppCollection(
  collectionPath: MaybeRef<string | null | undefined> = AppStorage.collection
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const path = computed(() => String(unref(collectionPath) ?? '').trim())
  const source = firestoreFetchCollection<AppCollectionDoc>(path)
  const apps = computed(() =>
    (source.value ?? []).filter((app) => String((app as any)?.status || '') !== 'retired')
  )
  const count = computed(() => apps.value.length)
  const pending = computed(() => source.pending.value)
  const error = computed(() => source.error.value)
  const active = computed(() => Boolean(path.value))
  const { outcome } = useFirestoreCollectionState({
    active,
    count,
    error,
    pending,
  })

  return { apps, count, pending, error, outcome }
}
