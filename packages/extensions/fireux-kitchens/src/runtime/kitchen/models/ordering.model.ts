import type { KitchenOrderType } from './order-lifecycle.model'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'

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
export type KitchenServiceHoursConfig = {
  inherit_kitchen_operation_hours?: boolean
  operation_hours?: WeekdayTimeWindowsConfig
}
export type KitchenOrderTypeConfig = {
  type: KitchenOrderType
  notice_hours?: number
  message?: string
  service_hours?: KitchenServiceHoursConfig
  asap_enabled?: boolean
  slot_interval_minutes?: number
  schedule_horizon_days?: number
  fulfilment?: KitchenOrderFulfilmentPolicy
  customer?: KitchenOrderCustomerPolicy
  availability?: KitchenOrderAvailabilityPolicy
  notifications?: KitchenOrderNotificationPolicy
}
/** Kitchen-owned service policy. Menu membership is explicit, never inferred from publication. */
export type KitchenOrderingService = KitchenOrderTypeConfig & {
  enabled: boolean
  menu_ids: string[]
}
export type KitchenOrderingConfig = { services: KitchenOrderingService[] }

/** Command input: null explicitly removes a previously configured deposit. */
export type KitchenOrderingServiceChanges = Omit<
  Partial<KitchenOrderingService>,
  'fulfilment'
> & {
  fulfilment?: Omit<KitchenOrderFulfilmentPolicy, 'deposit'> & {
    deposit?: KitchenOrderDepositPolicy | null
  }
}
