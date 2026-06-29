import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import { customerConfig } from '../config/customerConfig'
import type { Customer } from '../../../../../../models/profiles/Customer/Customer.model'

// Profile collection spine: sibling is profiles/Chef/fetch/useChefFetch.ts.
export function useCustomerFetch() {
  const { globalProfilesWithUser, localProfilesWithUser } =
    useProfileCollection<Customer>(customerConfig)

  const coreCustomers = computed(() => globalProfilesWithUser.value ?? [])
  const appCustomers = computed(() => localProfilesWithUser?.value ?? [])
  const { byId: coreCustomer } = useCollectionById(coreCustomers)
  const { byId: appCustomer } = useCollectionById(appCustomers)

  const pending = computed(() =>
    globalProfilesWithUser.value === undefined ||
    Boolean(localProfilesWithUser && localProfilesWithUser.value === undefined)
  )

  return {
    coreCustomers,
    appCustomers,
    coreCustomer,
    appCustomer,
    pending,
  }
}
