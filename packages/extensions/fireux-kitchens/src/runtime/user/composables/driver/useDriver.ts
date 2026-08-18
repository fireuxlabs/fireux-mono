// Profile family canon: docs/concepts/entities.md
import { computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { driverConfig } from '../firestore/profiles/Driver/config/driverConfig'
import type {
  AppDriver,
  Driver,
} from '../../models/driver.model.ts'
import { useDriverCreate } from '../firestore/profiles/Driver/mutations/useDriverCreate'
import { useDriverUpdate } from '../firestore/profiles/Driver/mutations/useDriverUpdate'

export type { AppDriver, Driver }

export function useDriver() {
  const { profile: refs, pending } = useProfile<Driver, AppDriver>(
    driverConfig
  )
  const { coreProfile, appProfile } = refs
  const { coreUser } = useUser()
  const driver = computed(() => ({
    user: coreUser.value ?? null,
    core: coreProfile.value ?? null,
    app: appProfile.value ?? null,
  }))
  const update = useDriverUpdate(refs)
  const create = useDriverCreate()

  return {
    profileRefs: refs,
    coreProfile,
    appProfile,
    coreUser,
    driver,
    pending,

    ...update,
    ...create,
  }
}
