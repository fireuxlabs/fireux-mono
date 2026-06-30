// Menu ordering canon: docs/concepts/menu-ordering.md
import { computed } from 'vue'
import { useCustomer } from '../../../firestore/profiles/Customer/useCustomer'
import type { KitchenOrderCustomer } from '../../../../../models/order.model'
import type {
  CustomerPrivate,
  CustomerSavedAddress,
} from '../../../../../models/profiles/Customer/Customer.model'

const text = (value: unknown) => String(value ?? '').trim()
const customerPrivate = (
  source: { private?: Partial<CustomerPrivate> } | null | undefined
) =>
  source?.private ?? {}
type CustomerAvatarLike = { avatar?: string }
const firstDefaultSavedAddress = (
  addresses: CustomerSavedAddress[] | undefined
) =>
  (addresses || []).find((address) => address.is_default) ||
  (addresses || [])[0] ||
  null

export function useKitchenOrderFunnelCustomerAutofill() {
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
    const appPrivate = customerPrivate(app)
    const profilePrivate = customerPrivate(profile)
    const profileAvatar = text(
      (app as CustomerAvatarLike | null)?.avatar ||
        (profile as CustomerAvatarLike | null)?.avatar
    )
    const savedAddress =
      firstDefaultSavedAddress(appPrivate.saved_addresses) ||
      firstDefaultSavedAddress(profilePrivate.saved_addresses)

    return {
      name: text(
        appPrivate.name ||
          profilePrivate.name ||
          profile?.title ||
          user?.display_name
      ),
      avatar: profileAvatar,
      avatar_url: text(profileAvatar || user?.avatar),
      phone: text(appPrivate.phone || profilePrivate.phone),
      address: text(
        savedAddress?.address ||
          appPrivate.default_delivery_address ||
          profilePrivate.default_delivery_address
      ),
      address_place_id: text(savedAddress?.place_id),
      allergy_note: text(appPrivate.allergy_note || profilePrivate.allergy_note),
    }
  })

  return { customer, pending }
}
