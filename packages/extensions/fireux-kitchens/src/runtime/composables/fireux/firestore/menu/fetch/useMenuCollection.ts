import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import type { Menu } from '../../../../../models/menu.model'

const GLOBAL_COLLECTION_PATH = 'menus'

export function useMenuCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const menus = firestoreFetchCollection<Menu>(GLOBAL_COLLECTION_PATH)
  const count = computed(() => menus.value?.length ?? 0)

  return {
    menus,
    count,
  }
}
