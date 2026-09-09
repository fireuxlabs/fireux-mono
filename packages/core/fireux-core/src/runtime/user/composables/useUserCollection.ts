import { computed } from 'vue'
import { normalizeUser } from '../utils/normalize-user'
import type { User } from '../models/user.model.ts'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'

/** Streams canonical User identities from the identity database. */
export function useUserCollection() {
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const source = firestoreFetchCollection<User>('users')
  const users = computed(() => (source.value ?? []).flatMap((raw) => {
    const user = normalizeUser(raw.id, raw)
    return user ? [user] : []
  }))
  return {
    users,
    count: computed(() => users.value.length),
    pending: source.pending,
    error: source.error,
    outcome: source.outcome,
  }
}
