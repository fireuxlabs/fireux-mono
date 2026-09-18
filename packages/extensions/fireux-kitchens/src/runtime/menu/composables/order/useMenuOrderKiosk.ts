// Concurrent edit — 2026-07-22 11:45 CEST — MenuOrder naming spine: place the Kiosk delta under the shared MenuOrder prefix.
import type { MaybeRefOrGetter } from 'vue'
import type { CustomerOrderSummary } from '../../../user/models/customer/order.model.ts'
import type { KitchenOrderType } from '../../../kitchen/utils/order.ts'
import { menuOrderRequestItems } from '../../utils/menu-order-request-items'
import {
  menuOrderPaymentLabel,
  type MenuOrderCheckoutInput,
} from '../../utils/menu-order-payment'
import type { MenuOrderBasketLine } from './useMenuOrderBasket'
import { useMenuOrderLifecycle } from './useMenuOrderLifecycle'

export type MenuOrderKioskType = Extract<
  KitchenOrderType,
  'eat_in' | 'takeaway'
>

type UseMenuOrderKioskOptions = {
  kitchenServiceId: MaybeRefOrGetter<string>
  kitchenId: MaybeRefOrGetter<string>
  kitchenSlug?: MaybeRefOrGetter<string>
  menuId: MaybeRefOrGetter<string>
  orderType: MenuOrderKioskType
  scopeKey: MaybeRefOrGetter<string>
  sourceMenuId: MaybeRefOrGetter<string>
}

type SubmitMenuOrderKioskInput = MenuOrderCheckoutInput & {
  lines: MenuOrderBasketLine[]
  sourceMenuId: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuOrderKiosk(options: UseMenuOrderKioskOptions) {
  const modeLabel = options.orderType === 'eat_in' ? 'Eat here' : 'Take away'
  const lifecycle = useMenuOrderLifecycle({
    ...options,
    fulfilmentLabel: recoveredKioskLabel,
  })

  async function submit(input: SubmitMenuOrderKioskInput) {
    const sourceMenuId = text(input.sourceMenuId)
    if (!sourceMenuId || !input.lines.length)
      throw new Error('The basket is empty.')
    const name = text(input.name)
    const phone = text(input.phone)
    const email = text(input.email)

    return lifecycle.submit({
      fulfilmentLabel: modeLabel,
      paymentLabel: menuOrderPaymentLabel(
        options.orderType,
        input.paymentMethod
      ),
      body: {
        channel: 'kiosk',
        order_type: options.orderType,
        items: menuOrderRequestItems(input.lines, sourceMenuId),
        payment_method: input.paymentMethod,
        ...(name || phone || email ? { customer: { name, phone, email } } : {}),
      },
    })
  }

  return {
    ...lifecycle,
    modeLabel,
    submit,
  }
}

function recoveredKioskLabel(order: CustomerOrderSummary) {
  return order.order_type === 'takeaway' ? 'Take away' : 'Eat here'
}
