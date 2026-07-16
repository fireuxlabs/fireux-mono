import { defineFireuxEntity } from 'fireux-core/runtime/models/core/entity.model.ts'
import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type {
  KitchenDeliveryZone,
  KitchenFulfilmentPaymentMethod,
} from '../../kitchen.model'
import type { KitchenOrderType } from '../order.model'
import type { WeekdayTimeWindowsConfig } from '../../shared/weekday-time.model'
import type { MenuRouteContext, MenuSurface } from './menu-context.model'
import type { MenuStatus } from './menu.model'

/** Kitchen-owned operational Menu record. */
export const KitchenMenuStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}',
  collection: 'menus',
  scopeCollection: 'menus',
  parent: 'kitchen',
  idParam: 'menuId',
  children: {
    sections: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}',
    items: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}',
  },
} as const

export const KitchenMenuEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'KitchenMenu',
  family: ['menu', 'kitchen'],
  storage: 'scoped',
  status: 'confirmed',
  scoped: KitchenMenuStorage.path,
  notes: [
    'KitchenMenu owns operator-managed content and ordering policy.',
    'Publishing may create or synchronize a root Menu.',
  ],
})

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
}

export type MenuOrderTypeConfig = {
  type: KitchenOrderType
  notice_hours?: number
  message?: string
  fulfilment?: MenuOrderFulfilmentPolicy
}

export type MenuServiceHoursConfig = {
  inherit_kitchen_operation_hours: boolean
  operation_hours?: WeekdayTimeWindowsConfig
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

export const KitchenMenuModel = {
  id: '' as string,
  kitchen_id: '' as string,
  name: '' as string,
  description: '' as string,
  status: 'draft' as MenuStatus,
  sort_order: 0 as number,
  doc_url: '' as string,
  doc_name: '' as string,
  doc_type: '' as string,
  doc_storage_path: '' as string,
  kiosk_skin_id: '' as string,
  ordering: {
    enabled: false,
    order_types: [] as MenuOrderTypeConfig[],
    service_hours: {
      inherit_kitchen_operation_hours: true,
    },
  } as MenuOrderingConfig,
  choices: [] as MenuChoice[],
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
} as const

type MutableModel<T> = { -readonly [K in keyof T]: T[K] }

export type KitchenMenu = MutableModel<typeof KitchenMenuModel>
export type KitchenMenuCreateInput = Omit<KitchenMenu, 'created' | 'updated'>
export type KitchenMenuUpdateInput = Partial<
  Omit<KitchenMenu, 'id' | 'created' | 'updated' | 'kitchen_id'>
>

// Transitional aliases keep operational consumers stable while imports move to
// the explicit KitchenMenu model family.
export const MenuStorage = KitchenMenuStorage
export const MenuEntity = KitchenMenuEntity
export const MenuModel = KitchenMenuModel
export type Menu = KitchenMenu
export type MenuCreateInput = KitchenMenuCreateInput
export type MenuUpdateInput = KitchenMenuUpdateInput
export type { MenuStatus }
