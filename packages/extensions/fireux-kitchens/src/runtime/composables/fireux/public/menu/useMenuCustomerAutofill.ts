// Menu ordering canon: docs/concepts/menu-ordering.md
import { computed } from 'vue'
import { useCustomer } from '../../firestore/profiles/Customer/useCustomer'
import type { KitchenOrderCustomer } from '../../../../models/order.model'

const text = (value: unknown) => String(value ?? '').trim()

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

    return {
      name: text(
        app?.customer_name ||
          profile?.customer_name ||
          profile?.title ||
          user?.display_name
      ),
      phone: text(app?.customer_phone || profile?.customer_phone),
      address: text(
        app?.default_delivery_address || profile?.default_delivery_address
      ),
      allergy_note: text(app?.allergy_note || profile?.allergy_note),
    }
  })

  return { customer, pending }
}
