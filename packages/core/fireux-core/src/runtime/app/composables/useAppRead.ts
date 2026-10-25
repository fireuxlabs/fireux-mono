import { computed, unref, type MaybeRef } from 'vue'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import type { App } from '../models/app.model'
import { readAppDocument } from '../utils/readApp'

/** Live read of one App through the shared Firestore reader. */
export function useAppRead(
  id: MaybeRef<string | null | undefined>,
  options: { collectionPath?: MaybeRef<string | null | undefined> } = {}
) {
  const { uid, isAuthenticated, hasAuthState } = useAuth()
  const targetId = computed(() =>
    hasAuthState.value && isAuthenticated.value && uid.value
      ? String(unref(id) ?? '').trim()
      : ''
  )
  const path = computed(
    () => String(unref(options.collectionPath) ?? '').trim() || 'apps'
  )
  const { firestoreFetchDoc } = useFirestoreRead()
  const source = firestoreFetchDoc<App>(path, targetId)
  // Initialization depends on document existence, even if its fields need repair.
  const exists = computed(() => {
    if (source.outcome.value === 'empty') return false
    if (source.outcome.value === 'ready') return true
    return undefined
  })
  const app = computed<App | null | undefined>(() => {
    if (!targetId.value || source.pending.value || source.error.value)
      return undefined
    if (!source.value) return null
    const { id: documentId, ...raw } = source.value
    return readAppDocument(raw, documentId)
  })
  const outcome = computed(() =>
    source.outcome.value === 'ready' && !app.value
      ? 'empty'
      : source.outcome.value
  )
  return { app, exists, pending: source.pending, error: source.error, outcome }
}
