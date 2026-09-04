import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { useAppUsers } from 'fireux-core/runtime/app/composables/useAppUsers'
import { computed } from 'vue'

/** Registered Customers are the current App's canonical AppUsers. */
export function useCustomerFetch() {
  const appUsers = useAppUsers()
  const customers = computed(() =>
    appUsers.fulfilled.value.map((entry) => ({
      id: entry.id,
      user: entry.coreUser,
      appUser: entry.appUser,
    }))
  )
  const { byId: customer } = useCollectionById(customers)

  return {
    customers,
    customer,
    pending: appUsers.pending,
    error: appUsers.error,
    outcome: appUsers.outcome,
    count: appUsers.count,
    truncated: appUsers.truncated,
    refresh: appUsers.refresh,
  }
}
