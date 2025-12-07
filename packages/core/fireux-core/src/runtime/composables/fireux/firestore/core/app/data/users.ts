import { computed, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import { useFirestoreRead } from '../../../operations/useFirestoreRead.ts'
import type { AppUser } from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * Fetch /apps/{appId}/users and expose the raw users collection.
 */
export function useAppUsers() {
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  const users = firestoreFetchCollection<AppUser>(`apps/${appId}/users`)
  const pending = computed(() => users.value === undefined)

  return {
    users: users as Ref<AppUser[] | undefined>,
    pending,
  }
}
