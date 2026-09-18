import type { KitchenOrderType } from '../../kitchen/utils/order.ts'
import type {
  KitchenOrderTypeConfig,
  KitchenOrderFulfilmentPolicy,
} from '../../kitchen/models/ordering.model'
import type {
  KitchenDeliveryZone,
  KitchenFulfilmentPaymentMethod,
} from '../../kitchen/models/fulfilment.model'
import type { MenuRouteContext, MenuSurface } from './menu-context.model'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'
import type { KitchenPublicService } from '../../kitchen/models/public-service.model'

export type MenuServiceHours = { operation_hours: WeekdayTimeWindowsConfig }

export type MenuOrderFulfilmentPolicy = KitchenOrderFulfilmentPolicy & {
  delivery_zones?: KitchenDeliveryZone[]
  payment_methods?: KitchenFulfilmentPaymentMethod[]
}

export type MenuOrderTypeConfig = Omit<KitchenOrderTypeConfig, 'fulfilment'> & {
  kitchen_service_id: string
  kitchen_service_name: string
  service_hours?: MenuServiceHours
  fulfilment?: MenuOrderFulfilmentPolicy
}
/** Derived Menu response only; never stored on a Menu. */

export type MenuOrderingConfig = {
  enabled: boolean
  order_types: MenuOrderTypeConfig[]
}

export type MenuChoice = {
  value: string
  label: string
  menu_id: string
  to?: string
  order_type?: KitchenOrderType
  kitchen_service_id?: string
  kitchen_service_name?: string
  message?: string
}

export type MenuServiceProfile = {
  services?: KitchenPublicService[]
  selectedServiceId?: string
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
