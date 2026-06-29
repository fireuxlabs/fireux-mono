// Profile family canon: docs/concepts/entities.md
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import {
  CustomerStorage,
  type Customer,
} from '../../../../../../models/profiles/Customer/Customer.model'

type CustomerPatch = Partial<Customer> & Record<string, unknown>

export function useCustomerUpdate(profile?: ProfileRefs<Customer> | null) {
  const base = useProfileUpdateBase<Customer>(
    CustomerStorage.rootCollection,
    profile
  )
  type UpdateOptions = { id?: string | null; scope?: 'core' | 'app' }

  const updateCoreProfile = async (
    patch: Partial<Customer>,
    options: { id?: string | null } = {}
  ) => {
    await base.updateCoreProfile(patch, options)
  }

  const updateAppProfile = base.updateAppProfile
  const commitUpdate = async (
    patch: Partial<Customer>,
    options: UpdateOptions = {}
  ) => {
    await base.commitUpdate(patch, options)
  }

  const updateCustomerName = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({
      'private.name': normalized ?? '',
    } as CustomerPatch)
  }

  const updateCustomerPhone = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({
      'private.phone': normalized ?? '',
    } as CustomerPatch)
  }

  const updateAllergyNote = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({
      'private.allergy_note': normalized ?? '',
    } as CustomerPatch)
  }

  const updateDefaultDeliveryAddress = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateCoreProfile({
      'private.default_delivery_address': normalized ?? '',
    } as CustomerPatch)
  }

  return {
    commitUpdate,
    updateCoreProfile,
    updateAppProfile,
    updateCustomerName,
    updateCustomerPhone,
    updateAllergyNote,
    updateDefaultDeliveryAddress,
  }
}
