import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

type ProjectCreateResponse = {
  ok: true
  project_id: string
  action: 'create' | 'resume'
}

export function useProjectWorkspaceCreate() {
  const { currentUser } = useAuth()
  const appSession = useAppSession()
  const fireux = useFireUXConfig()
  const sources = [currentUser, appSession.appUser, () => fireux.appId]
  const captureCommand = useCommandScope(sources)
  const pending = ref(false)
  const error = ref('')
  watch(sources, () => { pending.value = false; error.value = '' }, { flush: 'sync' })

  async function createProject(nameInput: string) {
    const isCurrent = captureCommand()
    const name = String(nameInput ?? '').trim()
    const user = currentUser.value
    if (!user)
      throw new Error('Wait for your identity before creating a Project.')
    if (!name || name.length > 120) {
      throw new Error(
        'Project name is required and must be 120 characters or fewer.'
      )
    }

    pending.value = true
    error.value = ''
    try {
      const token = await user.getIdToken()
      if (!isCurrent()) throw new Error('Project creation context changed. Try again.')
      const response = await $fetch<ProjectCreateResponse>(
        '/api/internal/control/projects',
        {
          method: 'POST',
          headers: { authorization: `Bearer ${token}` },
          body: { name },
        }
      )
      return response
    } catch (cause) {
      if (isCurrent()) error.value =
        cause instanceof Error ? cause.message : 'Project creation failed.'
      throw cause
    } finally {
      if (isCurrent()) pending.value = false
    }
  }

  return { createProject, pending, error }
}
