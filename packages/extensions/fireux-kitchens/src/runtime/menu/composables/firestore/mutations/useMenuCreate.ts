import { computed, unref, watch, type Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
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
  const { currentUser } = useAuth()
  const defaultKitchenId = computed(() =>
    String(
      unref(options.kitchenId) ||
        (options.useSelectedKitchen ? selectedId.value : '')
    ).trim()
  )
  let accountEpoch = 0
  let kitchenEpoch = 0
  // Synchronous invalidation also catches a scope changing away and back in one tick.
  watch(() => currentUser.value?.uid, () => { accountEpoch += 1 }, { flush: 'sync' })
  watch(defaultKitchenId, () => { kitchenEpoch += 1 }, { flush: 'sync' })

  async function createMenu(
    input: MenuCreateInput
  ): Promise<{ created: boolean; id: string; slug: string }> {
    const kitchenId = input.kitchenId || defaultKitchenId.value
    const explicitKitchen = Boolean(input.kitchenId)
    const expectedAccountEpoch = accountEpoch
    const expectedKitchenEpoch = kitchenEpoch
    const uid = currentUser.value?.uid
    const body = { ...input, kitchenId }
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || accountEpoch !== expectedAccountEpoch ||
        (!explicitKitchen && (defaultKitchenId.value !== kitchenId || kitchenEpoch !== expectedKitchenEpoch))) {
        throw new Error('The account or Kitchen changed. Try creating the Menu again.')
      }
    }
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid) throw new Error('The account changed. Try creating the Menu again.')
    const token = await user.getIdToken()
    assertScope()
    return $fetch('/api/workspace/kitchen/menus', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
  }
  return { createMenu }
}
