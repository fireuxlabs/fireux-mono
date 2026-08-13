// Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: define the sparse bounded published Kitchen index projection.
// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: define the bounded authenticated target projection.
// Concurrent edit — 2026-07-22 12:35 CEST — Kitchen palette console: project server-authorized write capability with resolved Menu style.
// Concurrent edit — 2026-07-22 15:12 CEST — Kitchen directory preview: expose bounded publication state to authorized admin/developer previews.
import type {
  KitchenFulfilmentConfig,
  KitchenMediaBackdropColor,
  KitchenMenusConfig,
  KitchenOrdersConfig,
  KitchenTablesConfig,
} from '../kitchen.model'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { ConsoleTheme } from 'fireux-core/types/theme'

export const PUBLIC_KITCHEN_INDEX_PAGE_SIZE = 24
export const PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE = 48

export type PublicKitchenImageKind = 'photograph' | 'brand'

export type PublicKitchenIndexItem = {
  id: string
  name: string
  slug: string
  visible: boolean
  management_mode: FireuxEntityManagement['mode']
  short_name?: string
  brand_tagline?: string
  formatted_address?: string
  short_address?: string
  logo_image_url?: string
  image_url?: string
  image_kind?: PublicKitchenImageKind
  media_backdrop_color?: KitchenMediaBackdropColor
}

export type PublicKitchenIndexPage = {
  items: PublicKitchenIndexItem[]
  nextCursor?: string
}

export type PublicKitchenDetail = PublicKitchenIndexItem & {
  management_app_id?: string
  route_scope: 'live'
  display_name: string
  sproochli?: Pick<
    SproochliAttachmentConfig,
    'enabled' | 'default_language' | 'requested_languages'
  >
  tagline?: string
  display_image_url?: string
  place_image_url?: string
  cover_image?: string
  food_gallery?: string[]
  about?: string
  phone?: string
  website?: string
  google_maps_url?: string
  currency_code?: string
  lat?: number
  lng?: number
}

export type PublicKitchenDetailResponse = {
  item: PublicKitchenDetail
}

export type KitchenPublicIdentityEdit = {
  display_name: string
  tagline: string
  card_image_url: string
  logo_image_url: string
}

export type KitchenPublicIdentityEditResponse = {
  ok: true
  kitchen_id: string
  identity: KitchenPublicIdentityEdit
}

export const KITCHEN_CONSOLE_TARGET_LIMIT = 50

export type KitchenConsoleTargetItem = {
  id: string
  can_write: boolean
  management: Exclude<FireuxEntityManagement, { mode: 'root' }>
  place_id: string
  slug: string
  visibility: boolean
  identity: {
    display_name: string
    tagline: string
    image_url: string
    card_image_url?: string
    logo_image_url?: string
    media_backdrop_color?: KitchenMediaBackdropColor
    wordmark_no_logo_image_url?: string
    wordmark_image_url?: string
    gallery: string[]
  }
  menus: KitchenMenusConfig
  console_theme?: ConsoleTheme
  orders?: KitchenOrdersConfig
  tables?: KitchenTablesConfig
  fulfilment: KitchenFulfilmentConfig
  sproochli: SproochliAttachmentConfig
  display_name: string
  name: string
  tagline?: string
  short_name?: string
  brand_tagline?: string
  formatted_address?: string
  short_address?: string
  image_url?: string
  media_backdrop_color?: KitchenMediaBackdropColor
  food_gallery?: string[]
  currency_code?: string
  claimed_by?: string
  about?: string
  website?: string
  phone?: string
  lat?: number
  lng?: number
  route_scope: 'live'
}

export type KitchenConsoleTargetsResponse = {
  ok: true
  appId: string
  family: 'kitchen'
  items: KitchenConsoleTargetItem[]
}
