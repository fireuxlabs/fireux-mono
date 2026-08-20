// Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: define the sparse bounded published Kitchen index projection.
// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Workspace targets: define the bounded authenticated target projection.
// Concurrent edit — 2026-07-22 12:35 CEST — Kitchen palette workspace: project server-authorized write capability with resolved Menu style.
// Concurrent edit — 2026-07-22 15:12 CEST — Kitchen directory preview: expose bounded publication state to authorized admin/developer previews.
import type {
  KitchenFulfilmentConfig,
  KitchenMediaBackdropColor,
  KitchenMenusConfig,
  KitchenOrdersConfig,
  KitchenTablesConfig,
} from './kitchen.model.ts'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { WorkspaceTheme } from 'fireux-core/types/theme'

export const KITCHEN_CONSOLE_TARGET_LIMIT = 50

export type KitchenWorkspaceTargetItem = {
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
  workspace_theme?: WorkspaceTheme
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

export type KitchenWorkspaceTargetsResponse = {
  ok: true
  appId: string
  family: 'kitchen'
  items: KitchenWorkspaceTargetItem[]
}
