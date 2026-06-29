// Menu ordering canon: docs/concepts/menu-ordering.md
import { computed } from 'vue'
import { useCustomer } from '../../firestore/profiles/Customer/useCustomer'
import type { KitchenOrderCustomer } from '../../../../models/order.model'
import type {
  CustomerSavedAddress,
} from '../../../../models/profiles/Customer/Customer.model'

const text = (value: unknown) => String(value ?? '').trim()
const firstDefaultSavedAddress = (
  addresses: CustomerSavedAddress[] | undefined
) =>
  (addresses || []).find((address) => address.is_default) ||
  (addresses || [])[0] ||
  null
const legacyDeliveryAddress = (source: unknown) => {
  const row = source as Record<string, unknown> | null | undefined

  return text(row?.deliveryaddress || row?.deliveryAddress)
}

export function useMenuCustomerAutofill() {
  const {
    coreProfile,
    appProfile,
    coreUser,
    pending,
  } = useCustomer()

  const customer = computed<KitchenOrderCustomer>(() => {
    const app = appProfile.value
    const profile = coreProfile.value
    const user = coreUser.value
    const savedAddress =
      firstDefaultSavedAddress(app?.saved_addresses) ||
      firstDefaultSavedAddress(profile?.saved_addresses)

    return {
      name: text(
        app?.customer_name ||
          profile?.customer_name ||
          profile?.title ||
          user?.display_name
      ),
      phone: text(app?.customer_phone || profile?.customer_phone),
      address: text(
        savedAddress?.address ||
          app?.default_delivery_address ||
          profile?.default_delivery_address ||
          legacyDeliveryAddress(app) ||
          legacyDeliveryAddress(profile)
      ),
      address_place_id: text(savedAddress?.place_id),
      allergy_note: text(app?.allergy_note || profile?.allergy_note),
    }
  })

  return { customer, pending }
}
