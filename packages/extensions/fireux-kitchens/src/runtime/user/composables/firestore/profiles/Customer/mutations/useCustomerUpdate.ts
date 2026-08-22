// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: write Customer ordering details only in app scope.
// Profile family canon: docs/concepts/entities.md
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import {
  CustomerStorage,
  type Customer,
} from '../../../../../utils/customer.ts'

type CustomerPatch = Partial<Customer> & Record<string, unknown>

export function useCustomerUpdate(
  profile?: ProfileRefs<Customer, Customer> | null
) {
  const base = useProfileUpdateBase<Customer>(CustomerStorage.document, profile)
  type UpdateOptions = { id?: string | null }

  const updateProfile = base.updateProfile
  const currentPreferences = () => {
    const preferences = profile?.profile.value?.preferences
    if (!preferences) {
      throw new Error('Load the Customer profile before updating preferences.')
    }
    return preferences
  }
  const commitUpdate = async (
    patch: Partial<Customer>,
    options: UpdateOptions = {}
  ) => {
    await updateProfile(patch, options)
  }

  const updateCustomerName = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateProfile({
      preferences: {
        ...currentPreferences(),
        name: normalized ?? '',
      },
    } as CustomerPatch)
  }

  const updateCustomerPhone = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateProfile({
      preferences: {
        ...currentPreferences(),
        phone: normalized ?? '',
      },
    } as CustomerPatch)
  }

  const updateAllergyNote = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateProfile({
      preferences: {
        ...currentPreferences(),
        allergy_note: normalized ?? '',
      },
    } as CustomerPatch)
  }

  const updateDefaultDeliveryAddress = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateProfile({
      preferences: {
        ...currentPreferences(),
        default_delivery_address: normalized ?? '',
      },
    } as CustomerPatch)
  }

  return {
    commitUpdate,
    updateProfile,
    updateCustomerName,
    updateCustomerPhone,
    updateAllergyNote,
    updateDefaultDeliveryAddress,
  }
}
