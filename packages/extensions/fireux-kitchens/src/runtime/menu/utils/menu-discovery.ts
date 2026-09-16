import type { MenuDirectoryEntry } from '../models/menu-directory.response'

export type MenuDiscoveryFilters = {
  query: string
  service: 'all' | 'delivery' | 'collection' | 'pre_order'
}

export type MenuDiscoveryGroup = {
  id: string
  name: string
  description?: string
  to: string
  image?: string
  logo?: string
  menus: MenuDirectoryEntry[]
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export function filterPublicMenus(
  menus: MenuDirectoryEntry[],
  filters: MenuDiscoveryFilters
) {
  const terms = normalize(filters.query.trim()).split(/\s+/).filter(Boolean)
  return menus.filter((menu) => {
    if (filters.service !== 'all' && !menu.contexts?.includes(filters.service))
      return false
    const text = normalize(
      [menu.name, menu.description, menu.kitchen?.name]
        .filter(Boolean)
        .join(' ')
    )
    return terms.every((term) => text.includes(term))
  })
}

export function groupPublicMenus(
  menus: MenuDirectoryEntry[]
): MenuDiscoveryGroup[] {
  const groups = new Map<string, MenuDiscoveryGroup>()
  for (const menu of menus) {
    // Group only by a proved relationship, never by a similar venue name.
    const id =
      menu.source?.app_id && menu.source.kitchen_id
        ? `venue:${menu.source.app_id}:${menu.source.kitchen_id}`
        : `menu:${menu.id}`
    let group = groups.get(id)
    if (!group) {
      group = {
        id,
        name: menu.kitchen?.name || menu.name,
        description: menu.kitchen?.description || menu.description,
        to: menu.source?.kitchen_slug
          ? `/kitchens/${encodeURIComponent(menu.source.kitchen_slug)}/menus`
          : `/menus/${encodeURIComponent(menu.id)}`,
        image: menu.kitchen?.image_url,
        logo: menu.kitchen?.logo_image_url,
        menus: [],
      }
      groups.set(id, group)
    }
    group.menus.push(menu)
  }
  for (const group of groups.values()) {
    group.menus.sort((left, right) =>
      (left.sort_order ?? Number.MAX_SAFE_INTEGER) -
      (right.sort_order ?? Number.MAX_SAFE_INTEGER)
    )
  }
  return [...groups.values()]
}
