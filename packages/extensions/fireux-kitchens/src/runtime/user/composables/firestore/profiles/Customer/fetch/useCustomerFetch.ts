// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: collect Customers from app scope only.
import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import { customerConfig } from '../config/customerConfig'
import type { Customer } from '../../../../../models/customer.model.ts'

// Profile collection spine: sibling is profiles/Chef/fetch/useChefFetch.ts.
export function useCustomerFetch() {
  const { globalProfiles, localProfiles, pending, error, outcome } =
    useProfileCollection<Customer>(customerConfig)

  const coreCustomers = computed(() => globalProfiles.value ?? [])
  const appCustomers = computed(() => localProfiles.value ?? [])
  const { byId: coreCustomer } = useCollectionById(coreCustomers)
  const { byId: appCustomer } = useCollectionById(appCustomers)

  return {
    coreCustomers,
    appCustomers,
    coreCustomer,
    appCustomer,
    pending,
    error,
    outcome,
  }
}
