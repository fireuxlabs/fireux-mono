import { computed, unref, type MaybeRef } from 'vue'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'
import type { User } from '../models/user.model'
import { normalizeUser } from '../utils/normalize-user'

/** Live read of one User through the shared Firestore reader. */
export function useUserRead(id: MaybeRef<string | null | undefined>) {
  const targetId = computed(() => String(unref(id) ?? '').trim())
  const { firestoreFetchDoc } = useFirestoreRead({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const source = firestoreFetchDoc<User>('users', targetId)
  const user = computed<User | null | undefined>(() => {
    if (!targetId.value || source.pending.value) return undefined
    if (source.error.value) return undefined
    return source.value ? normalizeUser(targetId.value, source.value) : null
  })
  return {
    user,
    pending: source.pending,
    error: source.error,
    outcome: source.outcome,
  }
}

export type UserRead = ReturnType<typeof useUserRead>
