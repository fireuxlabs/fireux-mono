import type { KitchenOrderCustomer, KitchenOrderType } from '../models/kitchen/order.model'

const text = (value: unknown) => String(value ?? '').trim()

export const menuOrderTypeLabel = (type: KitchenOrderType) => {
  const labels: Record<KitchenOrderType, string> = {
    dine_in: 'Dine in',
    collection: 'Collection',
    delivery: 'Delivery',
    pre_order: 'Pre-order',
    room_service: 'Room service',
  }

  return labels[type] || type
}

export const menuOrderBasketActionLabel = (type: KitchenOrderType) => {
  const labels: Record<KitchenOrderType, string> = {
    delivery: 'Organise delivery',
    collection: 'Organise collection',
    pre_order: 'Organise pre-order',
    room_service: 'Organise room service',
    dine_in: 'Send to kitchen',
  }

  return labels[type] || 'Place order'
}

export const menuOrderFunnelTitle = (type: KitchenOrderType) => {
  const labels: Record<KitchenOrderType, string> = {
    delivery: 'Organise delivery',
    collection: 'Organise collection',
    pre_order: 'Organise pre-order',
    room_service: 'Organise room service',
    dine_in: 'Send to kitchen',
  }

  return labels[type] || 'Send order'
}

export const menuOrderSubmitLabel = (type: KitchenOrderType) => {
  const labels: Record<KitchenOrderType, string> = {
    delivery: 'Send delivery order',
    collection: 'Send collection order',
    pre_order: 'Send pre-order',
    room_service: 'Send room service order',
    dine_in: 'Send order',
  }

  return labels[type] || 'Send order'
}

export const cleanKitchenOrderCustomer = (
  customer: KitchenOrderCustomer
): KitchenOrderCustomer =>
  Object.fromEntries(
    Object.entries(customer).filter(([, value]) => text(value))
  )
