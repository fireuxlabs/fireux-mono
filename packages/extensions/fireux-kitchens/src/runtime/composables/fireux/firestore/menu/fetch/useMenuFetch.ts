import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import type { Menu } from '../../../../../models/menu.model'

const GLOBAL_COLLECTION_PATH = 'menus'

export function useMenuFetch(
  menuId: string,
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const menu = firestoreFetchDoc<Menu>(GLOBAL_COLLECTION_PATH, menuId)
  const exists = computed(() => Boolean(menu.value))

  return {
    menu,
    exists,
  }
}

export type MenuFetchRefs = ReturnType<typeof useMenuFetch>
