import { computed, type Ref } from 'vue'
import type { User } from '../models/user.model.ts'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'

/**
 * Hydrates canonical User identity for domain rows whose document ids are UIDs.
 * Uses exact document reads so a profile collection never expands into a full
 * User collection scan.
 */
export function useUserHydration(ids: Ref<(string | null | undefined)[]>) {
  const databaseId = readRuntimeIdentityFirestoreDatabaseId()
  const { firestoreLoadDocsByIds } = useFirestoreRead({ databaseId })
  const binding = firestoreLoadDocsByIds<User>({
    collectionPath: 'users',
    ids,
  })
  const users = computed(() => binding.docs.value ?? [])
  const usersById = computed(
    () => new Map(users.value.map((user) => [user.id, user]))
  )
  const userById = (id: string | null | undefined) =>
    id ? usersById.value.get(id) : undefined

  return {
    users,
    usersById,
    userById,
    pending: binding.pending,
    error: binding.error,
    outcome: binding.outcome,
  }
}
