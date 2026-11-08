import { computed } from 'vue'
import type { CustomerSavedAddress } from '../../utils/customer.ts'
import { useCustomer as useCustomerProfile } from './useCustomer'

const text = (value: unknown) => String(value ?? '').trim()
const firstDefaultSavedAddress = (
  addresses: CustomerSavedAddress[] | undefined
) =>
  (addresses || []).find((address) => address.is_default) ||
  (addresses || [])[0] ||
  null

export function useCustomerAutofill() {
  const { customerProfile, user, pending } = useCustomerProfile()

  const customer = computed(() => {
    const preferences = customerProfile.value?.preferences
    const identity = user.value
    const savedAddress = firstDefaultSavedAddress(preferences?.saved_addresses)

    return {
      name: text(preferences?.name || identity?.display_name),
      phone: text(preferences?.phone),
      address: text(
        savedAddress?.address || preferences?.default_delivery_address
      ),
      address_place_id: text(savedAddress?.place_id),
      allergy_note: text(preferences?.allergy_note),
    }
  })

  return { customer, pending }
}
