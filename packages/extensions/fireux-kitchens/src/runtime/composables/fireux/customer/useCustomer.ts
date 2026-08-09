import { computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { useUser } from 'fireux-core/runtime/composables/fireux/user/useUser'
import type { AppCustomer, Customer } from '../../../models/customer.model'
import { customerConfig } from '../firestore/profiles/Customer/config/customerConfig'

export type { AppCustomer, Customer }

/** Active signed-in Customer profile context. Commands remain explicit imports. */
export function useCustomer() {
  const { profile: profileRefs, pending } = useProfile<Customer, AppCustomer>(
    customerConfig
  )
  const { coreProfile, appProfile } = profileRefs
  const { coreUser } = useUser()
  const customer = computed(() => ({
    user: coreUser.value ?? null,
    profile: appProfile.value ?? null,
  }))

  return {
    profileRefs,
    coreProfile,
    appProfile,
    coreUser,
    customer,
    pending,
  }
}
