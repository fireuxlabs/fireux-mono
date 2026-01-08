import { computed } from 'vue'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import type { User } from '../../../../../../models/core/user.model'

/**
 * Streams the canonical `/users` collection.
 * - Owns the raw list + total count.
 */
export function useGlobalUserCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<User>('users')

  const users = computed(() => source.value ?? [])
  const count = computed(() => users.value?.length ?? 0)

  return { users, count }
}
