// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: write Customer ordering details only in app scope.
// Profile family canon: docs/concepts/entities.md
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileAppUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import {
  CustomerStorage,
  type Customer,
} from '../../../../../models/customer.model.ts'

type CustomerPatch = Partial<Customer> & Record<string, unknown>

export function useCustomerUpdate(
  profile?: ProfileRefs<Customer, Customer> | null
) {
  const base = useProfileAppUpdateBase<Customer, Customer>(
    CustomerStorage.collection,
    profile
  )
  type UpdateOptions = { id?: string | null }

  const updateAppProfile = base.updateAppProfile
  const commitUpdate = async (
    patch: Partial<Customer>,
    options: UpdateOptions = {}
  ) => {
    await updateAppProfile(patch, options)
  }

  const updateCustomerName = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateAppProfile({
      'private.name': normalized ?? '',
    } as CustomerPatch)
  }

  const updateCustomerPhone = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateAppProfile({
      'private.phone': normalized ?? '',
    } as CustomerPatch)
  }

  const updateAllergyNote = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateAppProfile({
      'private.allergy_note': normalized ?? '',
    } as CustomerPatch)
  }

  const updateDefaultDeliveryAddress = async (value: string) => {
    const normalized = base.cleanString(value)
    await updateAppProfile({
      'private.default_delivery_address': normalized ?? '',
    } as CustomerPatch)
  }

  return {
    commitUpdate,
    updateAppProfile,
    updateCustomerName,
    updateCustomerPhone,
    updateAllergyNote,
    updateDefaultDeliveryAddress,
  }
}
