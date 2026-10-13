import type { KitchenOrderType } from './offering-interaction-types.model'

export type KitchenOrderDepositPolicy = {
  type: 'fixed' | 'fixed_per_person' | 'percent'
  amount: number
  currency_code?: string
  label?: string
}
export type KitchenOrderFulfilmentPolicy = {
  deposit?: KitchenOrderDepositPolicy
  handoff_instructions?: string
}
export const KitchenOrderContactFields = ['name', 'phone', 'email'] as const
export type KitchenOrderContactField =
  (typeof KitchenOrderContactFields)[number]
export type KitchenOrderCustomerPolicy = {
  required_fields?: KitchenOrderContactField[]
}
export type KitchenOrderAvailabilityPolicy = {
  paused?: boolean
  message?: string
}
export type KitchenOrderWhatsAppNotificationPolicy = {
  enabled?: boolean
  recipient_phone?: string
}
export type KitchenOrderNotificationPolicy = {
  whatsapp?: KitchenOrderWhatsAppNotificationPolicy
}
export type KitchenOrderTypeConfig = {
  type: KitchenOrderType
  table_channels?: { staff_pos: boolean; table_qr: boolean }
  notice_hours?: number
  message?: string
  asap_enabled?: boolean
  slot_interval_minutes?: number
  schedule_horizon_days?: number
  fulfilment?: KitchenOrderFulfilmentPolicy
  customer?: KitchenOrderCustomerPolicy
  availability?: KitchenOrderAvailabilityPolicy
  notifications?: KitchenOrderNotificationPolicy
}
