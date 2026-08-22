// Concurrent edit — 2026-07-20 15:11 CEST — Pre-order intake pass: carry dine-in party size through shared checkout and label settlement accurately.
import type { MenuPaymentMethod } from '../utils/menu.ts'
import type {
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../kitchen/utils/order.ts'

export type MenuOrderPaymentSelection = Extract<
  KitchenOrderPaymentMethod,
  'online_card' | 'pay_later'
>

export type MenuOrderPaymentOption = {
  value: MenuOrderPaymentSelection
  label: string
  description: string
  timing: 'now' | 'later'
}

export type MenuOrderCheckoutInput = {
  name: string
  phone: string
  email: string
  partySize?: number
  paymentMethod: MenuOrderPaymentSelection
}

const laterCopy: Record<
  KitchenOrderType,
  Pick<MenuOrderPaymentOption, 'label' | 'description'>
> = {
  collection: {
    label: 'Pay when you collect',
    description: 'Settle with the Kitchen at pickup.',
  },
  delivery: {
    label: 'Pay when delivered',
    description: 'Settle when the order reaches you.',
  },
  room_service: {
    label: 'Charge to room',
    description: 'Add this order to the room account.',
  },
  dine_in: {
    label: 'Pay at the table',
    description: 'Settle during table service.',
  },
  eat_in: {
    label: 'Pay at the counter',
    description: 'Settle when the order is handed over.',
  },
  takeaway: {
    label: 'Pay at the counter',
    description: 'Settle when the order is handed over.',
  },
  pre_order: {
    label: 'Pay at the table',
    description: 'Settle during table service.',
  },
}

export function menuOrderPaymentOptions(input: {
  orderType: KitchenOrderType
  paymentMethods: MenuPaymentMethod[]
}): MenuOrderPaymentOption[] {
  const methods = [...new Set(input.paymentMethods)]
  const options: MenuOrderPaymentOption[] = []

  if (methods.includes('online_card')) {
    options.push({
      value: 'online_card',
      label: 'Pay now',
      description: 'Pay securely online.',
      timing: 'now',
    })
  }
  if (methods.some((method) => method !== 'online_card')) {
    const copy =
      input.orderType === 'room_service' && !methods.includes('room_charge')
        ? {
            label: 'Pay later',
            description: 'Settle with the hotel during your stay.',
          }
        : laterCopy[input.orderType]
    options.push({
      value: 'pay_later',
      ...copy,
      timing: 'later',
    })
  }

  return options
}

export function menuOrderPaymentLabel(
  orderType: KitchenOrderType,
  selection: MenuOrderPaymentSelection
) {
  return selection === 'online_card' ? 'Pay online' : laterCopy[orderType].label
}

const persistedPaymentMethodLabels: Record<
  Exclude<KitchenOrderPaymentMethod, MenuOrderPaymentSelection>,
  string
> = {
  deposit: 'Online deposit',
  cash: 'Cash',
  card_at_pickup: 'Card at pickup',
  card_to_driver: 'Card to driver',
  room_charge: 'Charge to room',
}

export function kitchenOrderPaymentMethodLabel(
  orderType: KitchenOrderType,
  method: KitchenOrderPaymentMethod
) {
  return method === 'online_card' || method === 'pay_later'
    ? menuOrderPaymentLabel(orderType, method)
    : persistedPaymentMethodLabels[method]
}
