import type { MenuPaymentMethod } from '../models/kitchen/menu/menu.model'
import type {
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../models/kitchen/order.model'

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
  paymentMethod: MenuOrderPaymentSelection
}

const laterCopy: Record<KitchenOrderType, Pick<MenuOrderPaymentOption, 'label' | 'description'>> = {
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
    label: 'Pay later',
    description: 'Settle when the pre-order is fulfilled.',
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
  if (methods.some(method => method !== 'online_card')) {
    const copy = input.orderType === 'room_service' && !methods.includes('room_charge')
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
  return selection === 'online_card'
    ? 'Pay online'
    : laterCopy[orderType].label
}
