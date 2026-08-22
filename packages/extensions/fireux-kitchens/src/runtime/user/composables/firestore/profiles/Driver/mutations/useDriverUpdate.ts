// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: restrict Driver self-service writes to contact and tender preferences.
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import {
  useProfileAppStateUpdateBase,
  useProfileUpdateBase,
} from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import {
  DriverStorage,
  type DriverAppState,
  type Driver,
} from '../../../../../utils/driver.ts'

type UpdateOptions = { id?: string | null }

export function useDriverUpdate(
  profile?: ProfileRefs<Driver, DriverAppState> | null
) {
  const profileBase = useProfileUpdateBase<Driver, DriverAppState>(
    DriverStorage.document,
    profile
  )
  const appStateBase = useProfileAppStateUpdateBase<Driver, DriverAppState>(
    DriverStorage.document,
    profile
  )

  const updateProfile = async (
    patch: Partial<Driver>,
    options: { id?: string | null } = {}
  ) => {
    await profileBase.updateProfile(patch, options)
  }

  const updateAppState = async (
    patch: Partial<DriverAppState>,
    options: UpdateOptions = {}
  ) => {
    const allowed = new Set([
      'driver_phone',
      'accepts_weak_pings',
      'accepts_delivery_tenders',
    ])
    const forbidden = Object.keys(patch).filter((key) => !allowed.has(key))
    if (forbidden.length) {
      throw new Error(
        `[useDriverUpdate] Driver operational access is server-owned: ${forbidden.join(', ')}`
      )
    }
    await appStateBase.updateAppState(patch, options)
  }

  const updateDriverPhone = async (value: string) => {
    const normalized = appStateBase.cleanString(value)
    await updateAppState({ driver_phone: normalized ?? '' })
  }

  const updateAcceptsWeakPings = async (value: boolean) => {
    await updateAppState({ accepts_weak_pings: Boolean(value) })
  }

  const updateAcceptsDeliveryTenders = async (value: boolean) => {
    await updateAppState({ accepts_delivery_tenders: Boolean(value) })
  }

  return {
    updateProfile,
    updateAppState,
    updateDriverPhone,
    updateAcceptsWeakPings,
    updateAcceptsDeliveryTenders,
  }
}
