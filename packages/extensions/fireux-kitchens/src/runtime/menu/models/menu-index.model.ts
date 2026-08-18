// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: make absent Menu description sparse in the public index contract.
import type { MenuRouteContext } from './menu-context.model.ts'
import type { MenuServiceHoursConfig } from './kitchen-menu.model.ts'
import type { MenuKind, MenuSource } from './menu.model.ts'

export const PUBLIC_MENU_INDEX_PAGE_SIZE = 24
export const PUBLIC_MENU_INDEX_MAX_PAGE_SIZE = 50

export type PublicMenuIndexScope =
  | { kind: 'root' }
  | { kind: 'tenant', kitchenSlug: string }
  | { kind: 'directory', kitchenSlug: string }

export type PublicMenuIndexKitchen = {
  name: string
  logo_image_url?: string
  image_url?: string
  image_shade?: 'light' | 'dark' | 'none'
}

export type PublicMenuIndexItem = {
  id: string
  kind?: MenuKind
  name: string
  description?: string
  status: 'published'
  contexts?: MenuRouteContext[]
  kitchen?: PublicMenuIndexKitchen
  service_hours?: MenuServiceHoursConfig
  source?: MenuSource & {
    kitchen_slug?: string
    kitchen_name?: string
  }
}

export type PublicMenuIndexPage = {
  scope: PublicMenuIndexScope
  items: PublicMenuIndexItem[]
  nextCursor: string | null
}
