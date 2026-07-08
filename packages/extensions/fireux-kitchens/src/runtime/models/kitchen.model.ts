import { defineFireuxEntity } from 'fireux-core/runtime/models/core/entity.model.ts'
import type {
  FireuxAppScope as FireuxAppScopeShape,
  FireuxConsoleEntityAppScope,
  FireuxConsoleEntityIdentity,
  FireuxConsoleEntityVisibility,
  FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import {
  FireuxConsoleEntityAppScopeModel,
  FireuxConsoleEntityIdentityModel,
  FireuxConsoleEntityVisibilityModel,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model.ts'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model.ts'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { WeekdayTimeWindowsConfig } from './shared/weekday-time.model'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
  : T

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain
 * Storage: root canonical record plus app-scoped record
 * Root path: /kitchens/<kitchenId>
 * App path: /apps/<appId>/kitchens/<kitchenId>
 * Child scope: /apps/<appId>/kitchens/<kitchenId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Kitchen is one domain entity with a root public entity and an app-hosted scoped record.
 * - The root record stays thin and canonical; the app-scoped record carries governance and private operational state.
 * - Public facade depth can vary by family; Kitchen is expected to have a richer public face than some other app-scoped entities.
 * - If Kitchen needs a richer public or operational read shape, that should be built in fetch/runtime/interface layers, not by complicating the stored model file.
 * - App authority stays user-based in the app-scoped record; Chef is an optional presentation/authorship layer, not the ownership model.
 * - Kitchen-owned operational children should live beneath the app-hosted record.
 * - If that rule changes later, update the models README first, then this file.
 */
export const KitchenStorage = {
  shape: 'both',
  root: 'kitchens/{kitchenId}',
  scope: 'apps/{appId}/kitchens/{kitchenId}',
  rootCollection: 'kitchens',
  scopeCollection: 'kitchens',
  idParam: 'kitchenId',
  operationsRoot: 'apps/{appId}/kitchens/{kitchenId}',
  operations: [
    'overview',
    'identity',
    'menus',
    'ingredients',
    'mise',
    'recipes',
    'dishes',
    'stations',
    'suppliers',
    'team',
    'orders',
    'devices',
  ],
} as const

export type KitchenOperationKey = typeof KitchenStorage.operations[number]

export type KitchenAppScope = FireuxConsoleEntityAppScope

export type KitchenVisibility = FireuxConsoleEntityVisibility

export type KitchenImageShade = 'light' | 'dark' | 'none'

export type KitchenIdentity = FireuxConsoleEntityIdentity & {
  image_shade?: KitchenImageShade
}

export type KitchenMenusConfig = {
  currency_format: CurrencyDisplayFormat
  show_currency: boolean
  available?: boolean
  style?: Partial<PageStyle>
}

export type KitchenOrdersConfig = {
  modes: string[]
  default_lead_time_minutes: number
  acceptance_required: boolean
  operation_hours: WeekdayTimeWindowsConfig
  printing: {
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
  | 'online_card'
  | 'deposit'

export type KitchenFulfilmentConfig = {
  delivery_zones: KitchenDeliveryZone[]
  payment_methods: KitchenFulfilmentPaymentMethod[]
}

export const KitchenEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Kitchen',
  family: ['kitchen', 'console-entity'],
  storage: 'both',
  status: 'confirmed',
  console: true,
  root: KitchenStorage.root,
  scoped: KitchenStorage.scope,
})

export const KitchenModel = {
  id: '',
  place_id: '',
  slug: '',
  currency_code: '',

  // Level 1 Kitchen spine: these namespaces mirror console/kitchen route groups.
  // Records still live in operation-specific models and app-scoped collections.
  app_scope: {
    ...FireuxConsoleEntityAppScopeModel,
  } as KitchenAppScope,

  visibility: {
    ...FireuxConsoleEntityVisibilityModel,
  } as KitchenVisibility,

  identity: {
    ...FireuxConsoleEntityIdentityModel,
    image_shade: 'none',
  } as KitchenIdentity,

  // Default food-menu display config for this Kitchen.
  // Actual menu records live under the `menus` operation.
  menus: {
    currency_format: 'dash',
    show_currency: true,
    style: undefined,
  } as KitchenMenusConfig,

  // Kitchen-level ordering defaults. Order records live under the `orders` operation.
  orders: {
    modes: [],
    default_lead_time_minutes: 0,
    acceptance_required: true,
    operation_hours: {
      source: 'custom',
      timezone: 'Europe/Zurich',
      windows: [],
    },
    printing: {
      ticket_device_id: '',
    },
  } as KitchenOrdersConfig,

  // Kitchen-level fulfilment rules. Menus opt into delivery/collection/etc.;
  // the Kitchen owns the actual delivery zones, default payment methods, and
  // other venue service rules that public searches and ordering funnels consume.
  fulfilment: {
    delivery_zones: [],
    payment_methods: [],
  } as KitchenFulfilmentConfig,

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

export type Kitchen = Omit<
  WidenLiteral<typeof KitchenModel>,
  'app_scope' | 'menus' | 'fulfilment'
> &
  {
    app_scope: KitchenAppScope
    menus: KitchenMenusConfig
    fulfilment: KitchenFulfilmentConfig

    // Flat kitchen surface fields used by collection, route, and console views.
    app_scope_state?: FireuxAppScopeShape['app_scope_state']
    app_scope_app_id?: FireuxAppScopeShape['app_scope_app_id']
    is_test_kitchen?: boolean
    show?: boolean
    active?: boolean
    display_name?: string
    tagline?: string
    formatted_address?: string
    short_address?: string
    cover_image?: string
    display_image_url?: string
    image_shade?: KitchenImageShade
    food_gallery?: string[]
    currency_code?: string
    menu_currency_format?: CurrencyDisplayFormat
    menu_show_currency?: boolean
    menu_style?: Partial<PageStyle>
    menu_available?: boolean
    claimed_by?: string
  }

export type AppKitchen = {
  id: string
  operator_ids: string[]
  team_ids: string[]
  join_requests: string[]
  created: FireuxStamped['created']
  updated: FireuxStamped['updated']
}

export type KitchenCreateInput = Partial<
  Pick<
    Kitchen,
    | 'id'
    | 'place_id'
    | 'slug'
    | 'claimed_by'
    | 'formatted_address'
    | 'short_address'
    | 'cover_image'
    | 'currency_code'
    | 'identity'
    | 'menus'
  >
>

export type KitchenUpdateInput = Partial<Kitchen> & Record<string, unknown>
