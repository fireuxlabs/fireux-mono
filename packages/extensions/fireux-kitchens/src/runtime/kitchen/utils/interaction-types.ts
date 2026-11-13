export const KitchenOrderTypes = [
  'dine_in',
  'eat_in',
  'takeaway',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
] as const

export type KitchenOrderType = (typeof KitchenOrderTypes)[number]

export const KitchenOrderChannels = [
  'menu',
  'table_qr',
  'kiosk',
  'room_service',
  'staff_pos',
] as const

export type KitchenOrderChannel = (typeof KitchenOrderChannels)[number]

export const isKitchenOrderType = (value: unknown): value is KitchenOrderType =>
  KitchenOrderTypes.includes(value as KitchenOrderType)
export const isKitchenOrderChannel = (
  value: unknown
): value is KitchenOrderChannel =>
  KitchenOrderChannels.includes(value as KitchenOrderChannel)
