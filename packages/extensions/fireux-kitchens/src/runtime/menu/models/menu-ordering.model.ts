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
import type { KitchenPublicOffering } from '../../kitchen/models/public-offering.model'

export type MenuOfferingHours = { operation_hours: WeekdayTimeWindowsConfig }

export type MenuOrderFulfilmentPolicy = KitchenOrderFulfilmentPolicy & {
  delivery_zones?: KitchenDeliveryZone[]
  payment_methods?: KitchenFulfilmentPaymentMethod[]
}

export type MenuOrderTypeConfig = Omit<KitchenOrderTypeConfig, 'fulfilment'> & {
  kitchen_offering_id: string
  kitchen_offering_name: string
  offering_hours?: MenuOfferingHours
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
  kitchen_offering_id?: string
  kitchen_offering_name?: string
  message?: string
}

export type MenuOfferingProfile = {
  offerings?: KitchenPublicOffering[]
  selectedOfferingId?: string
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
