import type { KitchenOrderType } from '../../kitchen/models/order-lifecycle.model'
import type { MenuRouteContext } from './menu-context.model.ts'
import type { MenuKind, MenuSource } from './menu.model.ts'
import type { KitchenPublicService } from '../../kitchen/models/public-service.model'

export const MENU_DIRECTORY_PAGE_SIZE = 24
export const MENU_DIRECTORY_MAX_PAGE_SIZE = 50

export type MenuDirectoryScope =
  | { kind: 'root' }
  | { kind: 'tenant'; kitchenSlug: string }
  | { kind: 'directory'; kitchenSlug: string }

export type MenuDirectoryKitchen = {
  name: string
  description?: string
  logo_image_url?: string
  image_url?: string
  image_shade?: 'light' | 'dark' | 'none'
}

export type MenuDirectoryEntry = {
  id: string
  slug?: string
  kind?: MenuKind
  file_kind?: 'photo' | 'pdf' | 'document'
  name: string
  description?: string
  status: 'published'
  sort_order?: number
  contexts?: MenuRouteContext[]
  services?: KitchenPublicService[]
  service_options?: Array<{
    kitchen_service_id: string
    kitchen_service_name: string
    type: KitchenOrderType
    paused?: boolean
  }>
  kitchen?: MenuDirectoryKitchen
  source?: MenuSource & {
    menu_slug?: string
    kitchen_slug?: string
    kitchen_name?: string
  }
}

export type MenuDirectoryPage = {
  scope: MenuDirectoryScope
  items: MenuDirectoryEntry[]
  nextCursor: string | null
}
