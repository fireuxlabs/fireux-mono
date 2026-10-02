import { useRoute } from '#imports'
import { watch, onBeforeUnmount } from 'vue'
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
  let epoch = 0
  watch([selectedId, () => currentUser.value?.uid, () => route.fullPath], () => { epoch += 1 }, { flush: 'sync' })
  onBeforeUnmount(() => { epoch += 1 })
  async function mutate(method: 'POST' | 'PATCH' | 'DELETE', input: Record<string, unknown>, override?: string) {
    requireWritableData()
    const kitchenId = String(override || selectedId.value || '').trim()
    if (!kitchenId) throw new Error('Kitchen id is required')
    const expectedEpoch = epoch, uid = currentUser.value?.uid
    const body = JSON.parse(JSON.stringify({ ...input, kitchenId }))
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || expectedEpoch !== epoch)
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
    assertScope()
    return result
  }
  return { mutate }
}
