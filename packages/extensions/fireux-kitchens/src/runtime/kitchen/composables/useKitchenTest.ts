import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenChildCollection } from './firestore/utils/paths/useKitchenChildCollection'
import { useKitchenWorkspace } from './workspace/core/useKitchenWorkspace'

export function useKitchenTest() {
  const workspace = useKitchenWorkspace()
  const { currentUser } = useAuth()
  const source = useKitchenChildCollection<{ id: string; value: string }>(
    'tests',
    workspace.id
  )
  const records = source.items
  const pending = source.pending
  const error = source.error
  async function write(
    method: 'POST' | 'PATCH' | 'DELETE',
    id = '',
    value = ''
  ) {
    const kitchenId = workspace.id.value
    const user = currentUser.value
    if (!user || !kitchenId) throw new Error('Select a Kitchen and sign in.')
    const endpoint = '/api/workspace/kitchen/tests'
    await $fetch(id ? `${endpoint}/${encodeURIComponent(id)}` : endpoint, {
      method,
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
      body: { kitchenId, value },
      retry: 0,
      timeout: 20_000,
    })
  }
  return {
    id: workspace.id,
    records,
    pending,
    error,
    create: (value: string) => write('POST', '', value),
    update: (id: string, value: string) => write('PATCH', id, value),
    remove: (id: string) => write('DELETE', id),
  }
}
