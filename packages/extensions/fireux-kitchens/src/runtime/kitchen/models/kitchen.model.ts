// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: model Kitchen-owned payment applicability and fulfilment capability.
// Concurrent edit — 2026-07-20 20:51 CEST — Place-root authority pass: make Kitchen hours an optional operational override and remove Kitchen currency authority.
// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: classify Kitchen root identity and access-only App support.
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { CurrencyDisplayFormat } from '../../models/shared/currency-display.model.ts'
import type { Theme } from 'fireux-core/types/theme'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type { KitchenOrderType } from './order.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model.ts'

type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? WidenLiteral<U>[]
        : T extends Record<string, unknown>
          ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
          : T

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain
 * Storage: root canonical record with root-owned Team and operations
 * Root path: /kitchens/<kitchenId>
 * Child scope: /kitchens/<kitchenId>/<childCollection>/<childId>
 *
 * Decision note:
 * - The root owns Kitchen lifecycle, operational configuration,
 *   Team, and operations.
 * - The Kitchen id is the linked Place id. Place owns venue identity and media;
 *   Kitchen stores neither copied identity nor a redundant place_id.
 * - Kitchen Team is the sole Kitchen Workspace access authority.
 * - Chef is an optional User-owned profile, not Kitchen authority.
 */
export const KitchenStorage = {
  shape: 'root',
  path: 'kitchens/{kitchenId}',
  collection: 'kitchens',
  idParam: 'kitchenId',
  identity: {
    owner: 'Place',
    path: 'places/{kitchenId}',
    relation: 'same-id',
  },
  authority: {
    owner: 'KitchenTeamMember',
    path: 'kitchens/{kitchenId}/team/{memberId}',
    relation: 'active-exact-user',
  },
  children: {
    dishes: 'kitchens/{kitchenId}/dishes/{dishId}',
    ingredients:
      'kitchens/{kitchenId}/ingredients/{kitchenIngredientId}',
    menus: 'kitchens/{kitchenId}/menus/{menuId}',
    menuUploads: 'kitchens/{kitchenId}/menu-uploads/{uploadId}',
    miseTasks: 'kitchens/{kitchenId}/mise-tasks/{taskId}',
    orders: 'kitchens/{kitchenId}/orders/{orderId}',
    prepItems: 'kitchens/{kitchenId}/prep-items/{prepItemId}',
    recipes: 'kitchens/{kitchenId}/recipes/{recipeId}',
    sales: 'kitchens/{kitchenId}/sales/{saleId}',
    stations: 'kitchens/{kitchenId}/stations/{stationId}',
    supplierIngredients:
      'kitchens/{kitchenId}/supplier-ingredients/{supplierIngredientId}',
    team: 'kitchens/{kitchenId}/team/{memberId}',
    teamRequests: 'kitchens/{kitchenId}/team-requests/{requestId}',
  },
} as const

export type KitchenChildKey = keyof typeof KitchenStorage.children

/**
 * Product capabilities are not Firestore collection names. A capability may
 * coordinate several Kitchen children or derive evidence from them.
 */
export const KitchenCapabilities = [
  'dishes',
  'drinks',
  'ingredients',
  'menus',
  'prep',
  'service',
  'recipes',
  'stations',
  'suppliers',
  'team',
  'sales',
] as const

export type KitchenCapabilityKey = (typeof KitchenCapabilities)[number]

export type KitchenStatus = 'active' | 'inactive' | 'archived'

export type KitchenMenusConfig = {
  /** Confirmed Kitchen-specific knowledge used by Menu AI and operators. */
  context?: string
  currency_format: CurrencyDisplayFormat
  show_currency: boolean
  available?: boolean
  primary_menu_id?: string
  specials_enabled?: boolean
  specials_menu_id?: string
}

export type KitchenOrdersConfig = {
  modes?: string[]
  default_lead_time_minutes?: number
  acceptance_required?: boolean
  operation_hours?: WeekdayTimeWindowsConfig
  printing?: {
    ticket_device_id: string
  }
}

export type KitchenDeliveryZone = {
  id: string
  label: string
  min_order_chf?: number
  fee_chf?: number
  radius_m?: number
  postal_codes?: string[]
  place_ids?: string[]
  polygon?: Array<{
    lat: number
    lng: number
  }>
  color?: string
}

export type KitchenFulfilmentPaymentMethod =
  | 'cash'
  | 'card_at_pickup'
  | 'card_to_driver'
  | 'room_charge'
  | 'online_card'

export type KitchenPaymentRequirement = 'verified_room'

export type KitchenFulfilmentPaymentPolicy = {
  method: KitchenFulfilmentPaymentMethod
  order_types: KitchenOrderType[]
  requirements?: KitchenPaymentRequirement[]
}

export type KitchenFulfilmentConfig = {
  delivery_zones: KitchenDeliveryZone[]
  payment_methods: KitchenFulfilmentPaymentPolicy[]
}

export const KitchenEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Kitchen',
  family: ['kitchen', 'workspace-entity'],
  identity: 'root',
  authority: 'domain-database',
  appSupport: 'none',
  workspace: true,
  root: KitchenStorage.path,
})

export const KitchenDefaults = {
  id: '',
  slug: '',
  status: 'active' as KitchenStatus,
  visibility: false,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Kitchen = WidenLiteral<typeof KitchenDefaults> & {
  theme?: Theme
  menus?: KitchenMenusConfig
  orders?: KitchenOrdersConfig
  fulfilment?: KitchenFulfilmentConfig
  integrations?: {
    sproochli?: SproochliAttachmentConfig
  }
}

export type KitchenCreateInput = Partial<
  Pick<Kitchen, 'id' | 'slug' | 'status'>
>

export type KitchenUpdateInput = Partial<
  Pick<
    Kitchen,
    | 'slug'
    | 'status'
    | 'visibility'
    | 'theme'
    | 'menus'
    | 'orders'
    | 'fulfilment'
  >
>
