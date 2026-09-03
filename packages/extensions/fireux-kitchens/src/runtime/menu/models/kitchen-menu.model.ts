import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type {
  KitchenDeliveryZone,
  KitchenFulfilmentPaymentMethod,
} from '../../kitchen/models/fulfilment.model'
import type { KitchenOrderType } from '../../kitchen/models/order-lifecycle.model'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'
import type { MenuRouteContext, MenuSurface } from './menu-context.model'
import type { MenuStatus } from './menu.model'

export type MenuPaymentMethod = KitchenFulfilmentPaymentMethod
export type MenuDeliveryZone = KitchenDeliveryZone
export type MenuOrderDepositPolicy = {
  type: 'fixed' | 'fixed_per_person' | 'percent'
  amount: number
  currency_code?: string
  label?: string
}
export type MenuOrderFulfilmentPolicy = {
  delivery_zones?: MenuDeliveryZone[]
  payment_methods?: MenuPaymentMethod[]
  deposit?: MenuOrderDepositPolicy
  handoff_instructions?: string
}
export type MenuOrderContactField = 'name' | 'phone' | 'email'
export type MenuOrderCustomerPolicy = {
  required_fields?: MenuOrderContactField[]
}
export type MenuOrderAvailabilityPolicy = { paused?: boolean; message?: string }
export type MenuOrderWhatsAppNotificationPolicy = {
  enabled?: boolean
  recipient_phone?: string
}
export type MenuOrderNotificationPolicy = {
  whatsapp?: MenuOrderWhatsAppNotificationPolicy
}
export type MenuServiceHoursConfig = {
  inherit_kitchen_operation_hours?: boolean
  inherit_menu_service_hours?: boolean
  operation_hours?: WeekdayTimeWindowsConfig
}
export type MenuOrderTypeConfig = {
  type: KitchenOrderType
  notice_hours?: number
  message?: string
  service_hours?: MenuServiceHoursConfig
  asap_enabled?: boolean
  slot_interval_minutes?: number
  schedule_horizon_days?: number
  fulfilment?: MenuOrderFulfilmentPolicy
  customer?: MenuOrderCustomerPolicy
  availability?: MenuOrderAvailabilityPolicy
  notifications?: MenuOrderNotificationPolicy
}
export type MenuOrderingConfig = {
  enabled: boolean
  order_types: MenuOrderTypeConfig[]
  service_hours?: MenuServiceHoursConfig
}
export type MenuChoice = {
  value: string
  label: string
  menu_id: string
  to?: string
  order_type?: KitchenOrderType
  message?: string
}
export type MenuServiceProfile = {
  context: MenuRouteContext
  surface: MenuSurface
  ordering: MenuOrderingConfig
  orderingEnabled: boolean
  orderTypes: KitchenOrderType[]
  availableOrderTypes: KitchenOrderType[]
  defaultOrderType?: KitchenOrderType
  defaultOrderTypeConfig?: MenuOrderTypeConfig
  choices: MenuChoice[]
}

export type KitchenMenu = FireuxStamped & {
  id: string
  kitchen_id: string
  system_kind?: 'food' | 'drinks'
  name: string
  description: string
  status: MenuStatus
  sort_order: number
  doc_url: string
  doc_name: string
  doc_type: string
  doc_storage_path: string
  kiosk_skin_id: string
  ordering: MenuOrderingConfig
  choices: MenuChoice[]
  theme?: WorkspaceTheme
}
