import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { MenuStorage } from '../../../../../models/kitchen/menu/menu.model'
import type { MenuInterfaceSource } from '../utils/view/useMenuInterface'

export type MenuDoorway = MenuInterfaceSource

const sortMenus = (menus: MenuDoorway[]) =>
  [...menus].sort(
    (a, b) =>
      Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) ||
      String(a.name ?? '').localeCompare(String(b.name ?? ''))
  )

/**
 * Public root Menu doorway collection.
 *
 * Reads `menus/{menuId}` only. Kitchen/menu/source hydration belongs to the
 * menu detail manifest, not the public index list.
 */
export function useMenuCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<MenuDoorway>(MenuStorage.collection)
  const menus = computed(() =>
    sortMenus(source.value ?? []).filter((menu) => menu.status === 'published')
  )
  const count = computed(() => menus.value.length)
  const pending = computed(() => source.value === undefined)

  return {
    menus,
    count,
    pending,
  }
}
