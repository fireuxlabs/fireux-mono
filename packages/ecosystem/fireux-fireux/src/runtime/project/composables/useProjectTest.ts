import { useProjectTestRecords } from 'fireux-fireux/runtime/project/composables/useProjectTestRecords'
import { useTest } from 'fireux-core/runtime/composables/fireux/useTest'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectWorkspace } from 'fireux-fireux/runtime/project/composables/workspace/useProjectWorkspace'

export function useProjectTest() {
  const workspace = useProjectWorkspace()
  const { currentUser } = useAuth()
  const { records, pending, error } = useProjectTestRecords(workspace.id)
  async function write(
    method: 'POST' | 'PATCH' | 'DELETE',
    id = '',
    value = ''
  ) {
    const user = currentUser.value
    if (!user || !workspace.id.value)
      throw new Error('Select a Project and sign in.')
    const endpoint = `/api/internal/control/projects/${encodeURIComponent(workspace.id.value)}/tests`
    return $fetch<{ test?: { id: string } }>(id ? `${endpoint}/${encodeURIComponent(id)}` : endpoint, {
      method,
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
      body: { value },
      retry: 0,
      timeout: 20_000,
    })
  }
  return useTest({ id: workspace.id, family: 'project', records, pending, error, write })
}
