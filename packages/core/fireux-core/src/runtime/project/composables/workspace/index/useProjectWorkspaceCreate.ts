import { ref } from 'vue'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

type ProjectCreateResponse = {
  ok: true
  project_id: string
  action: 'create'
}

export function useProjectWorkspaceCreate() {
  const { currentUser } = useAuth()
  const workspace = useProjectWorkspace()
  const pending = ref(false)
  const error = ref('')

  async function createProject(nameInput: string) {
    const name = String(nameInput ?? '').trim()
    const user = currentUser.value
    if (!user) throw new Error('Sign in before creating a Project.')
    if (!name || name.length > 120) {
      throw new Error(
        'Project name is required and must be 120 characters or fewer.'
      )
    }

    pending.value = true
    error.value = ''
    try {
      const response = await $fetch<ProjectCreateResponse>(
        '/api/internal/control/projects',
        {
          method: 'POST',
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
          body: { name },
        }
      )
      await workspace.targets.refresh()
      workspace.actions.selectProject(response.project_id)
      return response
    } catch (cause) {
      error.value =
        cause instanceof Error ? cause.message : 'Project creation failed.'
      throw cause
    } finally {
      pending.value = false
    }
  }

  return { createProject, pending, error }
}
