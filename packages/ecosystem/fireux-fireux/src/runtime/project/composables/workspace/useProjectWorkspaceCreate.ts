import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { ref, watch } from 'vue'
import { useRoute } from '#imports'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
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
  const route = useRoute()
  const sources = [currentUser, appSession.appUser, () => fireux.appId, () => route.fullPath]
  const captureCommand = useCommandScope(sources)
  const pending = ref(false)
  const error = ref('')
  watch(sources, () => { pending.value = false; error.value = '' }, { flush: 'sync' })

  async function createProject(nameInput: string, options: { isCurrent?: () => boolean } = {}) {
    const captured = captureCommand()
    const isOwnerCurrent = options.isCurrent ?? (() => true)
    const isCurrent = () => captured() && isOwnerCurrent()
    const name = String(nameInput ?? '').trim()
    const user = currentUser.value
    error.value = ''
    if (!user) {
      error.value = 'Wait for your identity before creating a Project.'
      throw new Error(error.value)
    }
    if (!name || name.length > 120) {
      error.value = 'Project name is required and must be 120 characters or fewer.'
      throw new Error(error.value)
    }

    pending.value = true
    error.value = ''
    let failureMessage = 'Project creation failed. Try again.'
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
      if (response?.ok !== true || !isFirestoreDocumentId(response.project_id) ||
          !['create', 'resume'].includes(response.action) ||
          (user.isAnonymous && response.project_id !== user.uid)) {
        failureMessage = 'Project creation response was invalid.'
        throw new Error(failureMessage)
      }
      return response
    } catch (cause) {
      if (isCurrent()) error.value = failureMessage
      throw cause
    } finally {
      if (captured()) pending.value = false
    }
  }

  return { createProject, pending, error }
}
