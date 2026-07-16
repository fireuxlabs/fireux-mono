import { useFetch } from '#imports'
import { computed } from 'vue'
import type { MenuInterfaceSource } from '../utils/view/useMenuInterface'

export type MenuCollectionRow = MenuInterfaceSource

const sortMenus = (menus: MenuCollectionRow[]) =>
  [...menus].sort(
    (a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''))
  )

/**
 * Root Menu collection.
 *
 * Reads the public root Menu contract. Kitchen/menu/source hydration belongs
 * to the menu detail manifest, not the index list.
 */
export function useMenuCollection() {
  const { data, error, status } = useFetch<MenuCollectionRow[]>('/api/menus', {
    key: 'public-root-menus',
    default: () => [],
  })
  const menus = computed(() =>
    sortMenus(data.value).filter((menu) => menu.status === 'published')
  )
  const count = computed(() => menus.value.length)
  const pending = computed(() => status.value === 'pending')

  return {
    menus,
    count,
    pending,
    error,
  }
}
