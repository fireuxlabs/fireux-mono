import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import type { AppUser } from '../../../../../../models/core/user.model'

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
