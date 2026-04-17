import type { Ref } from 'vue'
import type { Menu } from '../../../../../../models/menu.model'
import { useKitchenConsoleCollection } from '../../fetch/useKitchenConsoleCollection'

type UseKitchenMenuCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
}

export function useKitchenMenuCollection(
  kitchenId: Ref<string> | string,
  options: UseKitchenMenuCollectionOptions = {}
) {
  const state = useKitchenConsoleCollection<Menu>('menus', kitchenId, options)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    collectionPath: state.collectionPath,
    menus: state.items,
    pending: state.pending,
  }
}
