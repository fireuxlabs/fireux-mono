import { computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import type { Customer } from '../../utils/customer.ts'
import { customerConfig } from '../firestore/profiles/Customer/config/customerConfig'

export type { Customer }

/** Active signed-in Customer profile context. Commands remain explicit imports. */
export function useCustomer() {
  const { profile: profileRefs, pending } = useProfile<Customer>(customerConfig)
  const { profile: customerProfile } = profileRefs
  const { coreUser } = useUserSession()
  const customer = computed(() => ({
    user: coreUser.value ?? null,
    profile: customerProfile.value ?? null,
  }))

  return {
    profileRefs,
    customerProfile,
    coreUser,
    customer,
    pending,
  }
}
