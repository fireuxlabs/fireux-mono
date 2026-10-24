import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/workspace/composables/useWorkspaceWriteGuard'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'

type CreateKitchenStationInput = {
  kitchenId: string
  name: string
  sortOrder?: number
}

export function useKitchenStationCreate() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { currentUser } = useAuth()
  const { selectedId } = useWorkspace('kitchen')
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const captureIntent = useCommandScope([selectedId, () => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value)])
  const createKitchenStation = async (input: CreateKitchenStationInput) => {
    requireWritableData()
    const body = { ...input }
    const isCurrent = captureIntent()
    const uid = currentUser.value?.uid
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || !isCurrent())
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
    if (!result?.id) throw new Error('Station response did not identify the created record.')
    return result.id
  }
  return { createKitchenStation }
}
