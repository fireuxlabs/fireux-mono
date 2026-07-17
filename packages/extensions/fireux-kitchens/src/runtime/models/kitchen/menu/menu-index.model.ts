export const PUBLIC_MENU_INDEX_PAGE_SIZE = 24
export const PUBLIC_MENU_INDEX_MAX_PAGE_SIZE = 50

export type PublicMenuIndexScope =
  | { kind: 'root' }
  | { kind: 'tenant', kitchenSlug: string }
  | { kind: 'directory', kitchenSlug: string }

export type PublicMenuIndexItem = {
  id: string
  kind?: string
  name: string
  description: string
  status: 'published'
  source?: {
    app_id?: string
    kitchen_id?: string
    kitchen_slug?: string
    menu_id?: string
  }
}

export type PublicMenuIndexPage = {
  scope: PublicMenuIndexScope
  items: PublicMenuIndexItem[]
  nextCursor: string | null
}
