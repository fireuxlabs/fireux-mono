import { computed, ref, type Ref } from 'vue'
import type { UserApp } from '../../../../../../models/core/user.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

/**
 * Fetch `/apps/{appId}/users` for an explicit app id.
 *
 * This is intentionally separate from `useAppUsers()` so the common runtime-bound
 * composable stays small and readable.
 *
 * NOTE (future): As collections get more complex (e.g. kitchens/recipes/orders),
 * prefer this pattern:
 * - Keep a simple runtime-bound composable (uses `useFireUXConfig()` context)
 * - Add a separate `*ById` composable for cross-app / route-driven surfaces
 * - Keep UI components standalone by letting them enrich from ids when needed
 */
export function useAppUsersByAppId(appId?: string | null | undefined) {
  const { firestoreFetchCollection } = useFirestoreRead()

  if (!appId) {
    const users = ref<UserApp[] | undefined>(undefined) as Ref<UserApp[] | undefined>
    const pending = computed(() => false)
    return { users, pending }
  }

  const users = firestoreFetchCollection<UserApp>(`apps/${appId}/users`)
  const pending = computed(() => users.value === undefined)

  return {
    users: users as Ref<UserApp[] | undefined>,
    pending,
  }
}
