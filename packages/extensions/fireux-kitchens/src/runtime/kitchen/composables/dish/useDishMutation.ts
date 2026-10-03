import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useKitchenWorkspaceSelection } from '../workspace/useKitchenWorkspaceSelection'

/** Shared credential and stale-intent boundary for the three Dish commands. */
export function useDishMutation() {
  const route = useRoute()
  const { currentUser } = useAuth()
  const { selectedId } = useKitchenWorkspaceSelection()
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const captureIntent = useCommandScope([selectedId, () => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value), () => route.fullPath])
  async function mutate(method: 'POST' | 'PATCH' | 'DELETE', input: Record<string, unknown>, override?: string) {
    requireWritableData()
    const kitchenId = String(override || selectedId.value || '').trim()
    if (!kitchenId) throw new Error('Kitchen id is required')
    const isCurrent = captureIntent(), uid = currentUser.value?.uid
    const body = JSON.parse(JSON.stringify({ ...input, kitchenId }))
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || !isCurrent())
        throw new Error('The account or Kitchen changed. Reopen the Dish editor.')
    }
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid) throw new Error('The account changed. Reopen the Dish editor.')
    const token = await user.getIdToken()
    assertScope()
    requireWritableData()
    const result = await $fetch<{ id: string }>('/api/workspace/kitchen/dishes', {
      method, headers: { Authorization: `Bearer ${token}` }, body,
    })
    if (!result?.id || (body.dishId && result.id !== body.dishId)) throw new Error('Command response did not identify the requested record.')
    return result
  }
  return { mutate }
}
