// Concurrent edit — 2026-07-22 11:45 CEST — MenuOrder naming spine: place the Collection delta under the shared MenuOrder prefix.
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

type UseMenuOrderPickupOptions = {
  kitchenOfferingId: MaybeRefOrGetter<string>
  kitchenId: MaybeRefOrGetter<string>
  kitchenSlug?: MaybeRefOrGetter<string>
  menuId: MaybeRefOrGetter<string>
  scopeKey: MaybeRefOrGetter<string>
  sourceMenuId: MaybeRefOrGetter<string>
}

type SubmitMenuOrderPickupInput = MenuOrderCheckoutInput & {
  lines: MenuOrderBasketLine[]
  selection: MenuOrderTimeSelection
  sourceMenuId: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuOrderPickup(options: UseMenuOrderPickupOptions) {
  const lifecycle = useMenuOrderLifecycle({
    ...options,
    orderType: 'collection',
    fulfilmentLabel: recoveredCollectionLabel,
  })

  async function submit(input: SubmitMenuOrderPickupInput) {
    const sourceMenuId = text(input.sourceMenuId)
    if (!sourceMenuId || !input.lines.length)
      throw new Error('The basket is empty.')
    const name = text(input.name)
    const phone = text(input.phone)
    const email = text(input.email)
    const collection = {
      mode: input.selection.mode,
      ...(input.selection.requestedFor
        ? { requested_for: input.selection.requestedFor }
        : {}),
    }

    return lifecycle.submit({
      fulfilmentLabel: input.selection.label,
      paymentLabel: menuOrderPaymentLabel('collection', input.paymentMethod),
      body: {
        channel: 'menu',
        order_type: 'collection',
        items: menuOrderRequestItems(input.lines, sourceMenuId),
        collection,
        ...(input.selection.requestedFor
          ? { requested_for: input.selection.requestedFor }
          : {}),
        payment_method: input.paymentMethod,
        ...(name || phone || email ? { customer: { name, phone, email } } : {}),
      },
    })
  }

  return {
    ...lifecycle,
    collectionLabel: lifecycle.fulfilmentLabel,
    submit,
  }
}

export type MenuOrderPickupStatus = ReturnType<
  typeof useMenuOrderPickup
>['status']['value']

function recoveredCollectionLabel(order: CustomerOrderSummary) {
  if (order.collection?.mode === 'queue') return 'As soon as possible'
  const value = text(order.collection?.requested_for)
  if (!value) return 'Scheduled collection'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Scheduled collection'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
