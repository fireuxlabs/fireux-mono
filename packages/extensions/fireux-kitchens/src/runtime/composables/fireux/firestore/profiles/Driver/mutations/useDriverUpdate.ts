// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: restrict Driver self-service writes to contact and tender preferences.
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import {
  DriverStorage,
  type AppDriver,
  type Driver,
} from '../../../../../../models/driver.model'

type UpdateOptions = { id?: string | null }

export function useDriverUpdate(
  profile?: ProfileRefs<Driver, AppDriver> | null
) {
  const base = useProfileUpdateBase<Driver>(
    DriverStorage.rootCollection,
    profile as ProfileRefs<Driver> | null | undefined
  )

  const updateCoreProfile = async (
    patch: Partial<Driver>,
    options: { id?: string | null } = {}
  ) => {
    await base.updateCoreProfile(patch, options)
  }

  const updateAppProfile = async (
    patch: Partial<AppDriver>,
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
    await base.updateAppProfile(
      patch as unknown as Partial<Driver>,
      options
    )
  }

  const updateDriverPhone = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateAppProfile({ driver_phone: normalized ?? '' })
  }

  const updateAcceptsWeakPings = async (value: boolean) => {
    await updateAppProfile({ accepts_weak_pings: Boolean(value) })
  }

  const updateAcceptsDeliveryTenders = async (value: boolean) => {
    await updateAppProfile({ accepts_delivery_tenders: Boolean(value) })
  }

  return {
    updateCoreProfile,
    updateAppProfile,
    updateDriverPhone,
    updateAcceptsWeakPings,
    updateAcceptsDeliveryTenders,
  }
}
