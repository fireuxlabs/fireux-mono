import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import { useRoute } from '#imports'
import { computed, unref, type Ref } from 'vue'
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
  const config = useFireUXConfig(), route = useRoute(), { appUser } = useUserSession()
  const captureActor = useCommandScope([() => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value), () => route.fullPath])
  const captureKitchen = useCommandScope([defaultKitchenId])

  async function createMenu(
    input: MenuCreateInput
  ): Promise<{ created: boolean; id: string; slug: string }> {
    const kitchenId = input.kitchenId || defaultKitchenId.value
    const explicitKitchen = Boolean(input.kitchenId)
    const isActorCurrent = captureActor()
    const isKitchenCurrent = captureKitchen()
    const uid = currentUser.value?.uid
    const body = JSON.parse(JSON.stringify({ ...input, kitchenId }))
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || !isActorCurrent() ||
        (!explicitKitchen && (!isKitchenCurrent()))) {
        throw new Error('The account or Kitchen changed. Try creating the Menu again.')
      }
    }
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid) throw new Error('The account changed. Try creating the Menu again.')
    const token = await user.getIdToken()
    assertScope()
    const result = await $fetch<{ created: boolean; id: string; slug: string; kitchenId: string }>('/api/workspace/kitchen/menus', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
    if (result?.created !== true || !result.id || !result.slug || result.kitchenId !== kitchenId) throw new Error('Menu creation response did not match the requested Kitchen.')
    return result
  }
  return { createMenu }
}
