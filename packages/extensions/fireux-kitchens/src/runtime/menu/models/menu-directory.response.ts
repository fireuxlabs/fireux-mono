import type { MenuRouteContext } from './menu-context.model.ts'
import type { MenuServiceHoursConfig } from './kitchen-menu.model.ts'
import type { MenuKind, MenuSource } from './menu.model.ts'

export const MENU_DIRECTORY_PAGE_SIZE = 24
export const MENU_DIRECTORY_MAX_PAGE_SIZE = 50

export type MenuDirectoryScope =
  | { kind: 'root' }
  | { kind: 'tenant'; kitchenSlug: string }
  | { kind: 'directory'; kitchenSlug: string }

export type MenuDirectoryKitchen = {
  name: string
  logo_image_url?: string
  image_url?: string
  image_shade?: 'light' | 'dark' | 'none'
}

export type MenuDirectoryEntry = {
  id: string
  kind?: MenuKind
  file_kind?: 'photo' | 'pdf' | 'document'
  name: string
  description?: string
  status: 'published'
  content_kind?: 'food' | 'drinks'
  contexts?: MenuRouteContext[]
  kitchen?: MenuDirectoryKitchen
  service_hours?: MenuServiceHoursConfig
  source?: MenuSource & {
    kitchen_slug?: string
    kitchen_name?: string
  }
}

export type MenuDirectoryPage = {
  scope: MenuDirectoryScope
  items: MenuDirectoryEntry[]
  nextCursor: string | null
}
