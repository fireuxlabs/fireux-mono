import { computed, unref, type Ref } from 'vue'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useKitchenWorkspaceSelection } from '../../../../kitchen/composables/workspace/useKitchenWorkspaceSelection'
import type { MenuCreateInput } from '../../../utils/menu-create-input'
export type { MenuCreateInput } from '../../../utils/menu-create-input'
export function useMenuCreate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    kitchenId?: string | Ref<string | null | undefined>
    useSelectedKitchen?: boolean
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { selectedId } = useKitchenWorkspaceSelection()
  const defaultKitchenId = computed(() =>
    String(
      unref(options.kitchenId) ||
        (options.useSelectedKitchen ? selectedId.value : '')
    ).trim()
  )
  async function createMenu(
    input: MenuCreateInput
  ): Promise<{ created: boolean; id: string }> {
    const user = await useRequireUser()
    return $fetch('/api/workspace/kitchen/menus', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      body: { ...input, kitchenId: input.kitchenId || defaultKitchenId.value },
    })
  }
  return { createMenu }
}
