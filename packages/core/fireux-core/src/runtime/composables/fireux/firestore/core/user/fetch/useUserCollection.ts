import { computed } from 'vue'
import type { User } from '../../../../../../models/core/user.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

/**
 * Streams the canonical `/users` collection.
 */
export function useUserCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<User>('users')

  const users = computed(() => source.value ?? [])
  const count = computed(() => users.value.length)

  return {
    users,
    count,
  }
}
