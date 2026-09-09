import { computed, unref, type MaybeRef } from 'vue'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import type { App } from '../models/app.model'
import { readAppDocument } from '../utils/readApp'

export type AppReadOutcome = 'idle' | 'pending' | 'ready' | 'missing' | 'error'

/** Live read of one App through the shared Firestore reader. */
export function useAppRead(
  id: MaybeRef<string | null | undefined>,
  options: { collectionPath?: MaybeRef<string | null | undefined> } = {}
) {
  const targetId = computed(() => String(unref(id) ?? '').trim())
  const path = computed(
    () => String(unref(options.collectionPath) ?? '').trim() || 'apps'
  )
  const { firestoreFetchDoc } = useFirestoreRead()
  const source = firestoreFetchDoc<App>(path, targetId)
  const app = computed<App | null | undefined>(() => {
    if (!targetId.value || source.pending.value) return undefined
    if (!source.value) return null
    const { id: documentId, ...raw } = source.value
    return readAppDocument(raw, documentId)
  })
  const outcome = computed(() =>
    source.outcome.value === 'ready' && !app.value
      ? 'missing'
      : source.outcome.value
  )
  return { app, pending: source.pending, error: source.error, outcome }
}
