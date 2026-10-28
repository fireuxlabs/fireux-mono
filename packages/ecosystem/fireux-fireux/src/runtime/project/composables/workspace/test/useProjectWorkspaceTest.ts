import { refreshNuxtData } from 'nuxt/app'
import { useProjectTestRecords } from '../../useProjectTestRecords'
import { useWorkspaceTest } from 'fireux-core/runtime/workspace/composables/useWorkspaceTest'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectWorkspace } from '../useProjectWorkspace'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'

export function useProjectWorkspaceTest() {
  const workspace = useProjectWorkspace()
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const { records, pending, error } = useProjectTestRecords(workspace.id)
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(appUser.value),
    () => workspace.id.value,
  ])
  async function write(
    method: 'POST' | 'PATCH' | 'DELETE',
    id = '',
    value = ''
  ) {
    const isCurrent = captureIntent()
    const entityId = workspace.id.value
    const user = currentUser.value
    if (!user || user.isAnonymous || !entityId)
      throw new Error('Select a Project and sign in.')
    const endpoint = `/api/internal/control/projects/${encodeURIComponent(entityId)}/tests`
    const body = { value }
    const token = await user.getIdToken()
    if (!isCurrent())
      throw new Error(
        'The account or selected Project changed. Reopen the action.'
      )
    const result = await $fetch<{
      ok: boolean
      project_id: string
      test?: { id: string }
      test_id?: string
      testId?: string
    }>(id ? `${endpoint}/${encodeURIComponent(id)}` : endpoint, {
      onResponse: async ({ options, response }) => {
        if (
          response.ok &&
          !['GET', 'HEAD'].includes(
            String(options.method || 'GET').toUpperCase()
          )
        )
          await refreshNuxtData()
      },
      method,
      headers: { authorization: `Bearer ${token}` },
      body,
      retry: 0,
      timeout: 20_000,
    })
    const returnedId =
      method === 'DELETE'
        ? (result?.test_id ?? result?.testId)
        : result?.test?.id
    if (
      result?.ok !== true ||
      result.project_id !== entityId ||
      !returnedId ||
      (id && returnedId !== id)
    )
      throw new Error(
        'Test response did not match the requested Project and Test.'
      )
    return result
  }
  return useWorkspaceTest({
    id: workspace.id,
    family: 'project',
    records,
    pending,
    error,
    write,
    captureIntent,
  })
}
