// Profile family canon: docs/concepts/entities.md
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import {
  DriverStorage,
  type Driver,
} from '../../../../../../models/driver.model'

export function useDriverUpdate(profile?: ProfileRefs<Driver> | null) {
  const base = useProfileUpdateBase<Driver>(DriverStorage.rootCollection, profile)
  type UpdateOptions = { id?: string | null; scope?: 'core' | 'app' }

  const updateCoreProfile = async (
    patch: Partial<Driver>,
    options: { id?: string | null } = {}
  ) => {
    await base.updateCoreProfile(patch, options)
  }

  const updateAppProfile = base.updateAppProfile
  const commitUpdate = async (
    patch: Partial<Driver>,
    options: UpdateOptions = {}
  ) => {
    await base.commitUpdate(patch, options)
  }

  const updateDriverName = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ driver_name: normalized ?? undefined })
  }

  const updateDriverPhone = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({ driver_phone: normalized ?? undefined })
  }

  const updateAcceptsWeakPings = async (value: boolean) => {
    await updateCoreProfile({ accepts_weak_pings: Boolean(value) })
  }

  const updateAcceptsDeliveryTenders = async (value: boolean) => {
    await updateCoreProfile({ accepts_delivery_tenders: Boolean(value) })
  }

  return {
    commitUpdate,
    updateCoreProfile,
    updateAppProfile,
    updateDriverName,
    updateDriverPhone,
    updateAcceptsWeakPings,
    updateAcceptsDeliveryTenders,
  }
}
