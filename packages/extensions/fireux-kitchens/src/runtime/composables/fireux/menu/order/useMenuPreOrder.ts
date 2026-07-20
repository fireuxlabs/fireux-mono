// Concurrent edit — 2026-07-19 17:12 CEST — Pre-order pass: supply the mandatory future-time request delta over shared lifecycle.
// Concurrent edit — 2026-07-20 15:11 CEST — Pre-order intake pass: submit advance table party size through the canonical Order lifecycle.
import type { MaybeRefOrGetter } from 'vue'
import type { CustomerOrderSummary } from '../../../../models/customer/order.model'
import type { MenuOrderTimeSelection } from '../../../../utils/menu-order-time'
import { menuOrderRequestItems } from '../../../../utils/menu-order-request-items'
import {
  menuOrderPaymentLabel,
  type MenuOrderCheckoutInput,
} from '../../../../utils/menu-order-payment'
import type { MenuOrderBasketLine } from './useMenuOrderBasket'
import { useMenuOrderLifecycle } from './useMenuOrderLifecycle'

type UseMenuPreOrderOptions = {
  kitchenId: MaybeRefOrGetter<string>
  kitchenSlug?: MaybeRefOrGetter<string>
  menuId: MaybeRefOrGetter<string>
  scopeKey: MaybeRefOrGetter<string>
  sourceMenuId: MaybeRefOrGetter<string>
}

type SubmitMenuPreOrderInput = MenuOrderCheckoutInput & {
  lines: MenuOrderBasketLine[]
  selection: MenuOrderTimeSelection
  sourceMenuId: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuPreOrder(options: UseMenuPreOrderOptions) {
  const lifecycle = useMenuOrderLifecycle({
    ...options,
    orderType: 'pre_order',
    fulfilmentLabel: recoveredPreOrderLabel,
  })

  async function submit(input: SubmitMenuPreOrderInput) {
    const sourceMenuId = text(input.sourceMenuId)
    const requestedFor = text(input.selection.requestedFor)
    if (!sourceMenuId || !input.lines.length) throw new Error('The basket is empty.')
    if (!requestedFor) throw new Error('Choose a requested date and time.')

    const name = text(input.name)
    const phone = text(input.phone)
    const email = text(input.email)
    const partySize = Number(input.partySize)
    if (!Number.isSafeInteger(partySize) || partySize < 1 || partySize > 500) {
      throw new Error('Add the number of guests for this pre-order.')
    }
    return lifecycle.submit({
      fulfilmentLabel: input.selection.label,
      paymentLabel: menuOrderPaymentLabel('pre_order', input.paymentMethod),
      body: {
        channel: 'menu',
        order_type: 'pre_order',
        items: menuOrderRequestItems(input.lines, sourceMenuId),
        requested_for: requestedFor,
        payment_method: input.paymentMethod,
        customer: {
          name,
          phone,
          email,
          party_size: partySize,
        },
      },
    })
  }

  return {
    ...lifecycle,
    preOrderLabel: lifecycle.fulfilmentLabel,
    submit,
  }
}

function recoveredPreOrderLabel(order: CustomerOrderSummary) {
  const value = text(order.requested_for)
  if (!value) return 'Requested time unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Requested time unavailable'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
