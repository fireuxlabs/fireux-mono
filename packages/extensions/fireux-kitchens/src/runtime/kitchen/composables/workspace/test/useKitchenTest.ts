import { useKitchenTestRecords } from '../../test/useKitchenTestRecords'
import { useWorkspaceTest } from 'fireux-core/runtime/workspace/composables/useWorkspaceTest'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'

export function useKitchenTest() {
  const workspace = useKitchenWorkspace()
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const { records, pending, error } = useKitchenTestRecords(workspace.id)
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid, () => config.appId,
    () => JSON.stringify(appUser.value), () => workspace.id.value,
  ])
  async function write(method: 'POST' | 'PATCH' | 'DELETE', id = '', value = '') {
    const isCurrent = captureIntent()
    const entityId = workspace.id.value
    const user = currentUser.value
    if (!user || user.isAnonymous || !entityId) throw new Error('Select a Kitchen and sign in.')
    const endpoint = '/api/workspace/kitchen/tests'
    const body = { kitchenId: entityId, value }
    const token = await user.getIdToken()
    if (!isCurrent()) throw new Error('The account or selected Kitchen changed. Reopen the action.')
    const result = await $fetch<{ ok: boolean; kitchen_id: string; test?: { id: string }; test_id?: string; testId?: string }>(id ? `${endpoint}/${encodeURIComponent(id)}` : endpoint, {
      method, headers: { authorization: `Bearer ${token}` }, body, retry: 0, timeout: 20_000,
    })
    const returnedId = method === 'DELETE' ? (result?.test_id ?? result?.testId) : result?.test?.id
    if (result?.ok !== true || result.kitchen_id !== entityId || !returnedId || (id && returnedId !== id))
      throw new Error('Test response did not match the requested Kitchen and Test.')
    return result
  }
  return useWorkspaceTest({ id: workspace.id, family: 'kitchen', records, pending, error, write, captureIntent })
}
