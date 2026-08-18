// Concurrent edit — 2026-07-19 16:58 CEST — Delivery pass: move shared customer autofill out of the alternate funnel tree.
// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: autofill from app-private Customer data only.
import { computed } from 'vue'
import { useCustomer as useCustomerProfile } from './useCustomer'
import type {
  CustomerPrivate,
  CustomerSavedAddress,
} from '../../models/customer.model.ts'

const text = (value: unknown) => String(value ?? '').trim()
const customerPrivate = (
  source: { private?: Partial<CustomerPrivate> } | null | undefined
) =>
  source?.private ?? {}
const firstDefaultSavedAddress = (
  addresses: CustomerSavedAddress[] | undefined
) =>
  (addresses || []).find((address) => address.is_default) ||
  (addresses || [])[0] ||
  null

export function useCustomerAutofill() {
  const {
    appProfile,
    coreUser,
    pending,
  } = useCustomerProfile()

  const customer = computed(() => {
    const app = appProfile.value
    const user = coreUser.value
    const appPrivate = customerPrivate(app)
    const savedAddress = firstDefaultSavedAddress(appPrivate.saved_addresses)

    return {
      name: text(appPrivate.name || user?.display_name),
      phone: text(appPrivate.phone),
      address: text(
        savedAddress?.address ||
          appPrivate.default_delivery_address
      ),
      address_place_id: text(savedAddress?.place_id),
      allergy_note: text(appPrivate.allergy_note),
    }
  })

  return { customer, pending }
}
