import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import { customerConfig } from '../config/customerConfig'
import type { Customer } from '../../../../../../models/customer.model'

// Profile collection spine: sibling is profiles/Chef/fetch/useChefFetch.ts.
export function useCustomerFetch() {
  const { globalProfiles, localProfiles } =
    useProfileCollection<Customer>(customerConfig)

  const coreCustomers = computed(() => globalProfiles.value ?? [])
  const appCustomers = computed(() => localProfiles?.value ?? [])
  const { byId: coreCustomer } = useCollectionById(coreCustomers)
  const { byId: appCustomer } = useCollectionById(appCustomers)

  const pending = computed(() =>
    globalProfiles.value === undefined ||
    Boolean(localProfiles && localProfiles.value === undefined)
  )

  return {
    coreCustomers,
    appCustomers,
    coreCustomer,
    appCustomer,
    pending,
  }
}
