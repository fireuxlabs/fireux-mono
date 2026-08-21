// Concurrent edit — 2026-07-22 11:45 CEST — MenuOrder naming spine: place the Delivery delta under the shared MenuOrder prefix.
import type { MaybeRefOrGetter } from 'vue'
import type { CustomerOrderSummary } from '../../../user/models/customer/order.model.ts'
import type { MenuOrderTimeSelection } from '../../utils/menu-order-time'
import { menuOrderRequestItems } from '../../utils/menu-order-request-items'
import {
  menuOrderPaymentLabel,
  type MenuOrderCheckoutInput,
} from '../../utils/menu-order-payment'
import type { MenuOrderBasketLine } from './useMenuOrderBasket'
import { useMenuOrderLifecycle } from './useMenuOrderLifecycle'

type UseMenuOrderDeliveryOptions = {
  kitchenId: MaybeRefOrGetter<string>
  kitchenSlug?: MaybeRefOrGetter<string>
  menuId: MaybeRefOrGetter<string>
  scopeKey: MaybeRefOrGetter<string>
  sourceMenuId: MaybeRefOrGetter<string>
}

type SubmitMenuOrderDeliveryInput = MenuOrderCheckoutInput & {
  address: string
  addressPlaceId?: string
  addressLabel: string
  lines: MenuOrderBasketLine[]
  selection: MenuOrderTimeSelection
  sourceMenuId: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuOrderDelivery(options: UseMenuOrderDeliveryOptions) {
  const lifecycle = useMenuOrderLifecycle({
    ...options,
    orderType: 'delivery',
    fulfilmentLabel: recoveredDeliveryLabel,
  })

  async function submit(input: SubmitMenuOrderDeliveryInput) {
    const sourceMenuId = text(input.sourceMenuId)
    const address = text(input.address)
    if (!sourceMenuId || !input.lines.length)
      throw new Error('The basket is empty.')
    if (!address) throw new Error('Choose a delivery address.')
    const name = text(input.name)
    const phone = text(input.phone)
    const email = text(input.email)

    return lifecycle.submit({
      fulfilmentLabel: text(input.addressLabel) || address,
      paymentLabel: menuOrderPaymentLabel('delivery', input.paymentMethod),
      body: {
        channel: 'menu',
        order_type: 'delivery',
        items: menuOrderRequestItems(input.lines, sourceMenuId),
        payment_method: input.paymentMethod,
        ...(input.selection.requestedFor
          ? { requested_for: input.selection.requestedFor }
          : {}),
        customer: {
          name,
          phone,
          email,
          address,
          ...(text(input.addressPlaceId)
            ? { address_place_id: text(input.addressPlaceId) }
            : {}),
        },
      },
    })
  }

  return {
    ...lifecycle,
    deliveryLabel: lifecycle.fulfilmentLabel,
    submit,
  }
}

function recoveredDeliveryLabel(order: CustomerOrderSummary) {
  const address = text(order.delivery?.address) || 'Delivery address confirmed'
  const requestedFor = text(order.requested_for)
  if (!requestedFor) return `As soon as possible · ${address}`
  const date = new Date(requestedFor)
  if (Number.isNaN(date.getTime())) return address
  const time = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)

  return `${time} · ${address}`
}
