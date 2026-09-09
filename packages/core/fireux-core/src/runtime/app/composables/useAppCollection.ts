import { computed, unref, type MaybeRef } from 'vue'
import { readAppDocument } from '../utils/readApp'
import type { App } from '../models/app.model.ts'
import { useFirestoreCollectionState } from '../../composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'

export function useAppCollection(
  collectionPath: MaybeRef<string | null | undefined> = 'apps'
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const path = computed(() => String(unref(collectionPath) ?? '').trim())
  const source = firestoreFetchCollection<App>(path)
  const apps = computed(() => (source.value ?? []).flatMap(({ id, ...raw }) => {
    const app = readAppDocument(raw, id)
    return app ? [app] : []
  }))
  const count = computed(() => apps.value.length)
  const pending = source.pending
  const error = source.error
  const active = computed(() => Boolean(path.value))
  const { outcome } = useFirestoreCollectionState({
    active,
    count,
    error,
    pending,
  })

  return { apps, count, pending, error, outcome }
}
