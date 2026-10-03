import { watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useKitchenWorkspaceSelection } from '../workspace/useKitchenWorkspaceSelection'

type CreateKitchenStationInput = {
  kitchenId: string
  name: string
  sortOrder?: number
}

export function useKitchenStationCreate() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { currentUser } = useAuth()
  const { selectedId } = useKitchenWorkspaceSelection()
  let revision = 0
  watch([selectedId, () => currentUser.value?.uid], () => { revision += 1 }, { flush: 'sync' })

  const createKitchenStation = async (input: CreateKitchenStationInput) => {
    requireWritableData()
    const body = { ...input }
    const expectedRevision = revision
    const uid = currentUser.value?.uid
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || revision !== expectedRevision)
        throw new Error('The account or Kitchen changed. Try adding the Station again.')
    }
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid) throw new Error('The account changed. Try adding the Station again.')
    const token = await user.getIdToken()
    assertScope()
    requireWritableData()
    const result = await $fetch<{ id: string }>('/api/workspace/kitchen/stations', {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body,
    })
    return result.id
  }
  return { createKitchenStation }
}
