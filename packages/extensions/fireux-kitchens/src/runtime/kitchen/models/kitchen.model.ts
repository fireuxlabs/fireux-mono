// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: model Kitchen-owned payment applicability and fulfilment capability.
// Concurrent edit — 2026-07-20 20:51 CEST — Place-root authority pass: make Kitchen hours an optional operational override and remove Kitchen currency authority.
// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: classify Kitchen root identity and access-only App support.
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import { FireuxEntityManagementDefaults } from 'fireux-core/runtime/models/utils/scope.model'
import type { CurrencyDisplayFormat } from '../../models/shared/currency-display.model.ts'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import type { WorkspaceTheme } from 'fireux-core/types/theme'
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
 * - The root owns Kitchen identity, management, configuration, Team, and operations.
 * - Management may associate the Kitchen with an App but never relocates it.
 * - Chef is an optional User-owned profile, not Kitchen authority.
 */
export const KitchenStorage = {
  shape: 'root',
  path: 'kitchens/{kitchenId}',
  collection: 'kitchens',
  idParam: 'kitchenId',
  operationsRoot: 'kitchens/{kitchenId}',
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

export type KitchenOperationKey = (typeof KitchenStorage.operations)[number]

/** @deprecated Read-only compatibility for unmigrated records and consumers. */
export type KitchenImageShade = 'light' | 'dark' | 'none'

export type KitchenIdentity = {
  /** Sparse override; empty means inherit the linked Place name. */
  display_name: string
  tagline: string
}

export type KitchenMediaBackdropColor = string

export type KitchenAssets = {
  image: string
  logo: string
  wordmark: string
  backdrop_color: KitchenMediaBackdropColor
}

export type KitchenMenusConfig = {
  /** Confirmed Kitchen-specific knowledge used by Menu AI and operators. */
  context?: string
  currency_format: CurrencyDisplayFormat
  show_currency: boolean
  available?: boolean
  primary_menu_id?: string
  specials_enabled?: boolean
  specials_menu_id?: string
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
  visibility: false,
  management: FireuxEntityManagementDefaults,

  identity: {
    display_name: '',
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
> & {
  identity: KitchenIdentity
  assets: KitchenAssets
  management: FireuxEntityManagement
  theme?: WorkspaceTheme
  menus?: KitchenMenusConfig
  orders?: KitchenOrdersConfig
  tables?: KitchenTablesConfig
  fulfilment?: KitchenFulfilmentConfig
  integrations?: {
    sproochli?: SproochliAttachmentConfig
  }
}

export type KitchenCreateInput = Partial<
  Pick<Kitchen, 'id' | 'slug' | 'identity' | 'assets' | 'management'>
>

export type KitchenUpdateInput = Partial<
  Pick<
    Kitchen,
    | 'slug'
    | 'identity'
    | 'assets'
    | 'visibility'
    | 'management'
    | 'theme'
    | 'menus'
    | 'orders'
    | 'tables'
    | 'fulfilment'
  >
> & {
  'identity.display_name'?: string
  'identity.tagline'?: string
  'assets.image'?: string
  'assets.logo'?: string
  'assets.wordmark'?: string
  'assets.backdrop_color'?: KitchenMediaBackdropColor
}
