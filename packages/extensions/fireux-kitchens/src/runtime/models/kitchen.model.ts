// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: model Kitchen-owned payment applicability and fulfilment capability.
// Concurrent edit — 2026-07-20 20:51 CEST — Place-root authority pass: make Kitchen hours an optional operational override and remove Kitchen currency authority.
// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: classify Kitchen root identity and access-only App support.
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type {
  FireuxConsoleEntityAppScope,
  FireuxConsoleEntityIdentity,
  FireuxConsoleEntityVisibility,
} from 'fireux-core/runtime/models/utils/console-entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import {
  FireuxConsoleEntityAppScopeModel,
  FireuxConsoleEntityVisibilityModel,
} from 'fireux-core/runtime/models/utils/console-entity.model'
import type { CurrencyDisplayFormat } from './shared/currency-display.model'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type { KitchenOrderType } from './kitchen/order.model'
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
  shape: 'root',
  path: 'kitchens/{kitchenId}',
  collection: 'kitchens',
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
    'tables',
    'orders',
    'devices',
  ],
} as const

export const AppKitchenStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}',
  collection: 'kitchens',
  parent: 'app',
  idParam: 'kitchenId',
} as const

export type KitchenOperationKey = typeof KitchenStorage.operations[number]

export type KitchenAppScope = FireuxConsoleEntityAppScope

export type KitchenVisibility = FireuxConsoleEntityVisibility

export type KitchenMediaBackdropColor = `#${string}`
/** @deprecated Read-only compatibility for unmigrated records and consumers. */
export type KitchenImageShade = 'light' | 'dark' | 'none'

export type KitchenIdentity = Omit<
  FireuxConsoleEntityIdentity,
  'image_url' | 'gallery'
> & {
  /** Sparse override; empty means inherit Place.media_backdrop_color. */
  media_backdrop_color?: KitchenMediaBackdropColor | ''
  /** @deprecated Read-only compatibility. */
  image_shade?: KitchenImageShade
  /** Optional Kitchen-owned card image. Empty means inherit Place.image_url. */
  card_image_url?: string
  logo_image_url?: string
  wordmark_no_logo_image_url?: string
  wordmark_image_url?: string
}

export type KitchenMenusConfig = {
  currency_format: CurrencyDisplayFormat
  show_currency: boolean
  available?: boolean
  style?: Partial<PageStyle>
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

export type KitchenTablesConfig = {
  count: number
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
  family: ['kitchen', 'console-entity'],
  identity: 'root',
  authority: 'owning-app-database',
  appSupport: 'access-record',
  publicRead: 'projection',
  status: 'confirmed',
  console: true,
  root: KitchenStorage.path,
  appSupportPath: AppKitchenStorage.path,
})

export const KitchenDefaults = {
  id: '',
  place_id: '',
  slug: '',

  // Level 1 Kitchen spine: these namespaces mirror console/kitchen route groups.
  // Records still live in operation-specific models and app-scoped collections.
  app_scope: {
    ...FireuxConsoleEntityAppScopeModel,
  } as KitchenAppScope,

  visibility: {
    ...FireuxConsoleEntityVisibilityModel,
  } as KitchenVisibility,

  identity: {
    display_name: '',
    tagline: '',
    media_backdrop_color: '',
    /** @deprecated Never write; migrate to media_backdrop_color. */
    image_shade: 'none' as KitchenImageShade,
    card_image_url: '',
    logo_image_url: '',
    wordmark_no_logo_image_url: '',
    wordmark_image_url: '',
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

  // Front-of-house table numbering. Individual table records can be added
  // later if tables gain names, zones, capacities, or independent lifecycle.
  tables: {
    count: 0,
  } as KitchenTablesConfig,

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
  WidenLiteral<typeof KitchenDefaults>,
  'app_scope' | 'menus' | 'fulfilment'
> &
  {
    app_scope: KitchenAppScope
    menus: KitchenMenusConfig
    fulfilment: KitchenFulfilmentConfig
    sproochli?: SproochliAttachmentConfig

    // Flat kitchen surface fields used by collection, route, and console views.
    app_scope_state?: KitchenAppScope['state']
    app_scope_app_id?: KitchenAppScope['app_id']
    is_test_kitchen?: boolean
    show?: boolean
    active?: boolean
    display_name?: string
    tagline?: string
    formatted_address?: string
    short_address?: string
    cover_image?: string
    display_image_url?: string
    wordmark_no_logo_image_url?: string
    wordmark_image_url?: string
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

export const AppKitchenDefaults: AppKitchen = {
  id: '',
  operator_ids: [],
  team_ids: [],
  join_requests: [],
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
    app_id: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export type KitchenCreateInput = Partial<
  Pick<
    Kitchen,
    | 'id'
    | 'place_id'
    | 'slug'
    | 'identity'
    | 'menus'
    | 'orders'
  >
>

export type KitchenUpdateInput = Partial<Kitchen> & Record<string, unknown>
