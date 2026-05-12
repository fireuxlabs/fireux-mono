import type { Ref } from 'vue'
import type { Menu } from '../../../../../../models/menu.model'
import { useKitchenChildCollection } from '../../collections/useKitchenChildCollection'

type UseKitchenMenuCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenMenuCollection(
  kitchenId: Ref<string> | string,
  options: UseKitchenMenuCollectionOptions = {}
) {
  const state = useKitchenChildCollection<Menu>('menus', kitchenId, options)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    collectionPath: state.collectionPath,
    menus: state.items,
    pending: state.pending,
  }
}
