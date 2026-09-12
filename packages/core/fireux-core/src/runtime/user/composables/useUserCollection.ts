import { computed } from 'vue'
import { normalizeUser } from '../utils/normalize-user'
import type { User } from '../models/user.model.ts'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'

/** Streams canonical User identities from the identity database. */
export function useUserCollection() {
  const { firestoreCollectionPage } = useFirestoreRead({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const source = firestoreCollectionPage<User>('users')
  const users = computed(() =>
    (source.data.value ?? []).flatMap((raw) => {
      const user = normalizeUser(raw.id, raw)
      return user ? [user] : []
    })
  )
  return {
    users,
    count: computed(() => users.value.length),
    hasMore: source.hasMore,
    loadMore: source.loadMore,
    pending: source.pending,
    error: source.error,
    outcome: source.outcome,
  }
}
