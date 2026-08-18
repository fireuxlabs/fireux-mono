import type { DishItemKind } from '../../models/dish.model.ts'
import {
  KitchenOrderDefaults,
  type KitchenOrder,
  type KitchenOrderChannel,
  type KitchenOrderItem,
  type KitchenOrderPayment,
  type KitchenOrderPaymentMethod,
  type KitchenOrderStatus,
  type KitchenOrderType,
} from '../../models/order.model.ts'
import {
  kitchenDemoCreated,
  kitchenDemoTimestamp,
  kitchenDemoUpdated,
} from '../core/fixtures'
import type { KitchenDemoIdentity } from '../core/types'

export type DemoOrderItemInput = {
  id: string
  itemId: string
  dishId: string
  itemKind: DishItemKind
  label: string
  unitPrice: number
  quantity?: number
  checked?: boolean
  variantId?: string
  variantLabel?: string
  addOns?: KitchenOrderItem['add_ons']
}

export type DemoOrderInput = {
  identity: KitchenDemoIdentity
  id?: string
  orderNumber?: string
  serviceId?: string
  serviceNumber: number
  status: KitchenOrderStatus
  orderType: KitchenOrderType
  channel: KitchenOrderChannel
  createdAt: string
  updatedAt?: string
  updatedBy?: string
  estimatedMinutes?: number
  estimatedAt?: string
  items: DemoOrderItemInput[]
  payment?: KitchenOrderPayment
  paymentMethod?: KitchenOrderPaymentMethod
  customerName?: string
  customerPhone?: string
  handoff?: 'tray' | 'bag'
  kitchenNote?: string
  totalMinor?: number
}

export const paymentMethods = (orderType: KitchenOrderType) =>
  orderType === 'collection'
    ? ['online_card', 'card_at_pickup']
    : ['card_at_pickup']

export const makeOrder = (input: DemoOrderInput): KitchenOrder => {
  const items: KitchenOrderItem[] = input.items.map((item) => ({
    id: item.id,
    source_item_id: item.itemId,
    menu_id: input.identity.menuId,
    dish_id: item.dishId,
    item_kind: item.itemKind,
    label: item.label,
    add_ons: item.addOns || [],
    variant_id: item.variantId,
    variant_label: item.variantLabel,
    unit_price: item.unitPrice,
    quantity: item.quantity ?? 1,
    checked: item.checked === true,
  }))
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unit_price || 0) * item.quantity,
    0
  )
  const reference = input.orderNumber ?? String(input.serviceNumber)
  const handoffInstructions = input.handoff === 'tray'
    ? 'Watch the screen for your tray number.'
    : input.handoff === 'bag'
      ? 'Collect your bag when your number is called.'
      : 'Collect from the counter.'

  return {
    ...KitchenOrderDefaults,
    id: input.id ?? `${input.identity.kitchenId}-demo-order-${reference}`,
    kitchen_id: input.identity.kitchenId,
    menu_id: input.identity.menuId,
    order_number: reference,
    service_id: input.serviceId ?? input.identity.serviceId,
    service_number: input.serviceNumber,
    status: input.status,
    order_type: input.orderType,
    collection: input.orderType === 'collection' ? { mode: 'queue' } : {},
    estimated_ready_minutes: input.estimatedMinutes || 0,
    estimated_ready_at: input.estimatedAt
      ? kitchenDemoTimestamp(input.estimatedAt)
      : '',
    items,
    pricing: {
      minor_unit_digits: 2,
      subtotal: {
        amount_minor: input.totalMinor ?? Math.round(subtotal * 100),
        currency_code: 'CHF',
      },
      delivery_fee: {
        amount_minor: 0,
        currency_code: 'CHF',
      },
      total: {
        amount_minor: input.totalMinor ?? Math.round(subtotal * 100),
        currency_code: 'CHF',
      },
    },
    fulfilment_policy: {
      order_type: input.orderType,
      ...(input.orderType === 'collection'
        ? {
            asap_enabled: true,
            customer: {
              required_fields: ['name', 'phone'],
            },
          }
        : {}),
      handoff_instructions: handoffInstructions,
      payment_methods: paymentMethods(input.orderType),
    },
    fulfilment_match: input.orderType === 'eat_in' || input.orderType === 'takeaway'
      ? {
          type: 'counter',
          reference,
          handoff: input.handoff || (input.orderType === 'eat_in' ? 'tray' : 'bag'),
        }
      : {},
    customer: {
      ...(input.customerName ? { name: input.customerName } : {}),
      ...(input.customerPhone ? { phone: input.customerPhone } : {}),
    },
    kitchen_note: input.kitchenNote || '',
    payment: input.payment || {
      required: false,
      status: 'not_required',
      method: input.paymentMethod || 'card_at_pickup',
      currency_code: 'CHF',
    },
    channel: input.channel,
    created: kitchenDemoCreated(input.identity, input.createdAt, 'menu'),
    updated: kitchenDemoUpdated(
      input.updatedAt || input.createdAt,
      input.updatedBy || 'menu'
    ),
  }
}
