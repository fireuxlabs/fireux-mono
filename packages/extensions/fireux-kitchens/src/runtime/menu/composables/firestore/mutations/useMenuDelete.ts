import type { WatchSource } from 'vue'
import { useMenuMutation } from './useMenuMutation'
export function useMenuDelete(sources: WatchSource[] = []) {
  const { mutate } = useMenuMutation(sources)
  return {
    deleteMenu: (
      kitchenId: string,
      menuId: string,
      isCurrent?: () => boolean
    ) => mutate('', 'DELETE', { kitchenId, menuId }, isCurrent),
  }
}
