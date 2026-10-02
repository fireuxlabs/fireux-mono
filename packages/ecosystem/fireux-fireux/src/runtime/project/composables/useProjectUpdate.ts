import { unref, watch, type MaybeRef } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Project } from '../models/project.model'

export type ProjectIdentityChanges = Partial<Pick<Project, 'name' | 'description' | 'image_url'>>

export function useProjectUpdate(id: MaybeRef<string | null | undefined>) {
  const { currentUser } = useAuth()
  let scopeEpoch = 0
  watch([() => currentUser.value?.uid, () => unref(id)], () => { scopeEpoch += 1 }, { flush: 'sync' })

  async function updateProject(changes: ProjectIdentityChanges) {
    const epoch = scopeEpoch
    const projectId = String(unref(id) || '').trim()
    const user = currentUser.value
    const body = { ...changes }
    if (!projectId || !user || user.isAnonymous)
      throw new Error('Sign in and select a Project before editing Identity.')
    const token = await user.getIdToken()
    if (epoch !== scopeEpoch || currentUser.value?.uid !== user.uid || String(unref(id) || '').trim() !== projectId)
      throw new Error('The account or selected Project changed. Reopen the editor.')
    await $fetch(`/api/internal/control/projects/${encodeURIComponent(projectId)}/identity`, {
      method: 'PATCH', headers: { authorization: `Bearer ${token}` }, body,
    })
    // The existing Project listener observes the committed record.
  }

  return { updateProject }
}
