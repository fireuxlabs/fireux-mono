// Profile family canon: docs/concepts/entities.md
import { computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { driverConfig } from '../firestore/profiles/Driver/config/driverConfig'
import type { Driver, DriverAppState } from '../../models/driver.model.ts'
import { useDriverCreate } from '../firestore/profiles/Driver/mutations/useDriverCreate'
import { useDriverUpdate } from '../firestore/profiles/Driver/mutations/useDriverUpdate'

export type { Driver, DriverAppState }

export function useDriver() {
  const { profile: refs, pending } = useProfile<Driver, DriverAppState>(
    driverConfig
  )
  const { profile: driverProfile, appState: driverAppState } = refs
  const { coreUser } = useUser()
  const driver = computed(() => ({
    user: coreUser.value ?? null,
    profile: driverProfile.value ?? null,
    appState: driverAppState.value ?? null,
  }))
  const update = useDriverUpdate(refs)
  const create = useDriverCreate()

  return {
    profileRefs: refs,
    driverProfile,
    driverAppState,
    coreUser,
    driver,
    pending,

    ...update,
    ...create,
  }
}
