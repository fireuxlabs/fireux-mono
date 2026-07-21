// Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: define the sparse bounded published Kitchen index projection.
// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: define the bounded authenticated target projection.
import type {
  KitchenFulfilmentConfig,
  KitchenImageShade,
  KitchenMenusConfig,
  KitchenOrdersConfig,
  KitchenTablesConfig,
} from '../kitchen.model'

export const PUBLIC_KITCHEN_INDEX_PAGE_SIZE = 24
export const PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE = 48

export type PublicKitchenIndexItem = {
  id: string
  name: string
  slug: string
  short_name?: string
  brand_tagline?: string
  formatted_address?: string
  short_address?: string
  image_url?: string
  image_shade?: KitchenImageShade
}

export type PublicKitchenIndexPage = {
  items: PublicKitchenIndexItem[]
  nextCursor?: string
}

export const KITCHEN_CONSOLE_TARGET_LIMIT = 50

export type KitchenConsoleTargetItem = {
  id: string
  app_scope: {
    state: 'parent_app' | 'tenant_app'
    app_id: string
  }
  place_id: string
  slug: string
  visibility: {
    show: boolean
    active: boolean
    is_test: boolean
  }
  identity: {
    display_name: string
    tagline: string
    image_url: string
    image_shade: KitchenImageShade
    wordmark_no_logo_image_url?: string
    wordmark_image_url?: string
    gallery: string[]
  }
  menus: KitchenMenusConfig
  orders?: KitchenOrdersConfig
  tables?: KitchenTablesConfig
  fulfilment: KitchenFulfilmentConfig
  show: boolean
  active: boolean
  is_test_kitchen: boolean
  display_name: string
  name: string
  tagline?: string
  short_name?: string
  brand_tagline?: string
  formatted_address?: string
  short_address?: string
  image_url?: string
  image_shade?: KitchenImageShade
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
  items: KitchenConsoleTargetItem[]
}
