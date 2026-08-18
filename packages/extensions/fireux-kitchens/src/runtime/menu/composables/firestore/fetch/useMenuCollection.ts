import { computed } from 'vue'
import type { MenuInterfaceSource } from '../utils/view/useMenuInterface'
import { usePublicMenuIndex } from '../../usePublicMenuIndex'

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
  const index = usePublicMenuIndex()
  const menus = computed(() =>
    sortMenus(index.menus.value).filter((menu) => menu.status === 'published')
  )
  const count = computed(() => menus.value.length)

  return {
    menus,
    count,
    pending: index.pending,
    error: index.error,
    hasMore: index.hasMore,
    loadingMore: index.loadingMore,
    loadMoreError: index.loadMoreError,
    loadMore: index.loadMore,
  }
}
