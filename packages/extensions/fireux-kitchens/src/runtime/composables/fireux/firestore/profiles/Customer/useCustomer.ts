// Profile family canon: docs/concepts/entities.md
import { computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { customerConfig } from './config/customerConfig'
import type {
  AppCustomer,
  Customer,
} from '../../../../../models/profiles/Customer/Customer.model'
import { useCustomerCreate } from './mutations/useCustomerCreate'
import { useCustomerUpdate } from './mutations/useCustomerUpdate'

export type { AppCustomer, Customer }

export function useCustomer() {
  const { profile: refs, pending } = useProfile<Customer, AppCustomer>(
    customerConfig
  )
  const { coreProfile, appProfile } = refs
  const { coreUser } = useUser()
  const customer = computed(() => ({
    user: coreUser.value ?? null,
    core: coreProfile.value ?? null,
    app: appProfile.value ?? null,
  }))
  const update = useCustomerUpdate(refs)
  const create = useCustomerCreate()

  return {
    profileRefs: refs,
    coreProfile,
    appProfile,
    coreUser,
    customer,
    pending,

    ...update,
    ...create,
  }
}
