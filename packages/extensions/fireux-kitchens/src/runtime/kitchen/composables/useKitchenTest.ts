import { useKitchenTestRecords } from './useKitchenTestRecords'
import { useTest } from 'fireux-core/runtime/composables/fireux/useTest'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspace } from './workspace/core/useKitchenWorkspace'

export function useKitchenTest() {
  const workspace = useKitchenWorkspace()
  const { currentUser } = useAuth()
  const { records, pending, error } = useKitchenTestRecords(workspace.id)
  async function write(
    method: 'POST' | 'PATCH' | 'DELETE',
    id = '',
    value = ''
  ) {
    const kitchenId = workspace.id.value
    const user = currentUser.value
    if (!user || !kitchenId) throw new Error('Select a Kitchen and sign in.')
    const endpoint = '/api/workspace/kitchen/tests'
    return $fetch<{ test?: { id: string } }>(id ? `${endpoint}/${encodeURIComponent(id)}` : endpoint, {
      method,
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
      body: { kitchenId, value },
      retry: 0,
      timeout: 20_000,
    })
  }
  return useTest({ id: workspace.id, family: 'kitchen', records, pending, error, write })
}
