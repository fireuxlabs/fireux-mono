import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Project } from '../models/project.model'

export type ProjectIdentityChanges = Partial<
  Pick<Project['identity'], 'name' | 'description' | 'image_url'>
>

export function useProjectUpdate() {
  const { currentUser } = useAuth()

  async function updateProject(input: {
    projectId: string
    changes: ProjectIdentityChanges
  }) {
    const projectId = String(input.projectId || '').trim()
    const changes = { ...input.changes }
    const user = currentUser.value
    if (!projectId || !user || user.isAnonymous)
      throw new Error('Sign in and select a Project before editing Identity.')
    const token = await user.getIdToken()
    if (currentUser.value?.uid !== user.uid)
      throw new Error('The signed-in account changed. Try again.')
    const result = await $fetch<{ ok: true; project_id: string }>(
      `/api/internal/control/projects/${encodeURIComponent(projectId)}/identity`,
      {
        method: 'PATCH',
        headers: { authorization: `Bearer ${token}` },
        body: changes,
        retry: 0,
        timeout: 15000,
      }
    )
    if (result?.ok !== true || result.project_id !== projectId)
      throw new Error(
        'Project update response did not match the requested Project.'
      )
  }
  return { updateProject }
}
