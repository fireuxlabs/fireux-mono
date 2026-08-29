// Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: define the sparse bounded published Kitchen index projection.
// Concurrent edit — 2026-08-23 CEST — Kitchen Workspace reset: define the authenticated Kitchen projection.
// Concurrent edit — 2026-07-22 12:35 CEST — Kitchen palette workspace: project server-authorized write capability with resolved Menu style.
// Concurrent edit — 2026-07-22 15:12 CEST — Kitchen directory preview: expose bounded publication state to authorized admin/developer previews.
import type { KitchenFulfilment } from './fulfilment.model.ts'
import type {
  KitchenMenusConfig,
  KitchenOrdersConfig,
} from './kitchen-configuration.model.ts'
import type { MediaBackdropColor } from 'fireux-places/runtime/place/utils/place-spine'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type { Theme } from 'fireux-core/types/theme'

export const KITCHEN_USER_LIMIT = 50

export type KitchenWorkspaceKitchen = {
  id: string
  can_write: boolean
  slug: string
  visibility: boolean
  identity: {
    display_name: string
    tagline: string
    image_url: string
    media_backdrop_color?: MediaBackdropColor
    wordmark_image_url?: string
    gallery: string[]
  }
  menus: KitchenMenusConfig
  theme?: Theme
  orders?: KitchenOrdersConfig
  fulfilment: KitchenFulfilment
  sproochli: SproochliAttachmentConfig
  display_name: string
  name: string
  tagline?: string
  short_name?: string
  tagline?: string
  formatted_address?: string
  short_address?: string
  image_url?: string
  media_backdrop_color?: MediaBackdropColor
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

export type KitchenWorkspaceKitchensResponse = {
  ok: true
  family: 'kitchen'
  primary_kitchen_id: string
  items: KitchenWorkspaceKitchen[]
}

export type KitchenWorkspaceCurrentResponse = {
  ok: true
  family: 'kitchen'
  current: KitchenWorkspaceKitchen | null
}
