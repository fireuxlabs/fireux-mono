import type { MenuRouteContext } from './menu-context.model'
import type { MenuKind, MenuSource } from './menu.model'

export const PUBLIC_MENU_INDEX_PAGE_SIZE = 24
export const PUBLIC_MENU_INDEX_MAX_PAGE_SIZE = 50

export type PublicMenuIndexScope =
  | { kind: 'root' }
  | { kind: 'tenant', kitchenSlug: string }
  | { kind: 'directory', kitchenSlug: string }

export type PublicMenuIndexItem = {
  id: string
  kind?: MenuKind
  name: string
  description: string
  status: 'published'
  contexts?: MenuRouteContext[]
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
