// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: model Kitchen-owned payment applicability and fulfilment capability.
// Concurrent edit — 2026-07-20 20:51 CEST — Place-root authority pass: make Kitchen hours an optional operational override and remove Kitchen currency authority.
// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: classify Kitchen root identity and access-only App support.
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import { FireuxEntityManagementDefaults } from 'fireux-core/runtime/models/utils/scope.model'
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
 * - Kitchen is one domain entity with a canonical root and an App-hosted access record.
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

export type KitchenMediaBackdropColor = `#${string}`
/** @deprecated Read-only compatibility for unmigrated records and consumers. */
export type KitchenImageShade = 'light' | 'dark' | 'none'

export type KitchenIdentity = {
  /** Sparse override; empty means inherit the linked Place name. */
  name: string
  tagline: string
}

export type KitchenAssets = {
  image: string
  logo: string
  wordmark: string
  backdrop_color: KitchenMediaBackdropColor | ''
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

export type KitchenConsoleConfig = {
  menus?: KitchenMenusConfig
  orders?: KitchenOrdersConfig
  tables?: KitchenTablesConfig
  fulfilment?: KitchenFulfilmentConfig
  integrations?: {
    sproochli?: SproochliAttachmentConfig
  }
}

export const KitchenEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Kitchen',
  family: ['kitchen', 'console-entity'],
  identity: 'root',
  authority: 'owning-app-database',
  appSupport: 'access-record',
  publicRead: 'projection',
  console: true,
  root: KitchenStorage.path,
  appSupportPath: AppKitchenStorage.path,
})

export const KitchenDefaults = {
  id: '',
  slug: '',
  visibility: false,
  management: FireuxEntityManagementDefaults,

  identity: {
    name: '',
    tagline: '',
  } as KitchenIdentity,

  assets: {
    image: '',
    logo: '',
    wordmark: '',
    backdrop_color: '',
  } as KitchenAssets,

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
  'identity' | 'assets'
> &
  {
    identity: KitchenIdentity
    assets: KitchenAssets
    management: FireuxEntityManagement
  }

export type AppKitchen = {
  id: string
  operator_ids: string[]
  team_ids: string[]
  join_requests: string[]
  created: FireuxStamped['created']
  updated: FireuxStamped['updated']
  console: KitchenConsoleConfig
}

export const AppKitchenDefaults: AppKitchen = {
  id: '',
  operator_ids: [],
  team_ids: [],
  join_requests: [],
  console: {},
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
    | 'slug'
    | 'identity'
    | 'assets'
    | 'management'
  >
>

export type KitchenUpdateInput = Partial<
  Pick<
    Kitchen,
    'slug' | 'identity' | 'assets' | 'visibility' | 'management'
  >
> & {
  'identity.name'?: string
  'identity.tagline'?: string
  'assets.image'?: string
  'assets.logo'?: string
  'assets.wordmark'?: string
  'assets.backdrop_color'?: string
}
