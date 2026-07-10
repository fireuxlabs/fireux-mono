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

/**
 * Family: Menu.
 *
 * Menu follows the same root/scope spine as Kitchen. The root menu record gives
 * the menu its stable listable URL. The scoped Kitchen Menu record owns the
 * operator-managed content, sections, items, and ordering policy.
 *
 * Dish describes food. Menu presents selected dishes. MenuSection and MenuItem
 * live in their own child model files.
 *
 * Use `main` for a Kitchen's primary/default menu id. `default` is reserved
 * for language/settings vocabulary, not menu document names. User-facing menu
 * names such as "Comida Casera" live in `name`, not in the document id.
 *
 * Canon paths:
 * - menus/{menuId}
 * - apps/{appId}/kitchens/{kitchenId}/menus/{menuId}
 * - apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}
 * - apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}
 */
export const MenuStorage = {
  shape: 'both',
  root: 'menus/{menuId}',
  scope: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}',
  rootCollection: 'menus',
  scopeCollection: 'menus',
  parent: 'kitchen',
  idParam: 'menuId',
  children: {
    sections: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}',
    items: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}',
  },
} as const

export const MenuEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Menu',
  family: ['menu', 'kitchen'],
  storage: 'both',
  status: 'confirmed',
  root: MenuStorage.root,
  scoped: MenuStorage.scope,
  notes: [
    'Menu has a root record and a Kitchen-scoped operating record.',
    'Root menus keep stable list/detail URLs.',
    'Kitchen-scoped menus own sections, items, and ordering policy.',
  ],
})

export type MenuStatus = 'draft' | 'published' | 'archived'
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

export type MenuDocument = {
  url: string
  name: string
  type: string
  storage_path: string
}

export const MenuModel = {
  id: '' as string,
  kitchen_id: '' as string,
  name: '' as string,
  description: '' as string,
  status: 'draft' as MenuStatus,
  /**
   * Future note: Menu availability is distinct from Kitchen opening hours and
   * Place business hours. Add an explicit schedule field only when the menu
   * needs service-window behavior; do not infer it from Kitchen or Place.
   */
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

type MutableModel<T> = {
  -readonly [K in keyof T]: T[K]
}

export type Menu = MutableModel<typeof MenuModel>

export type MenuCreateInput = Omit<Menu, 'created' | 'updated'>
export type MenuUpdateInput = Partial<
  Omit<Menu, 'id' | 'created' | 'updated' | 'kitchen_id'>
>
