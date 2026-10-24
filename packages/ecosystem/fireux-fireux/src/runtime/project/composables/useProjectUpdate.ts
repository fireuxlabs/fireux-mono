import { useRoute } from '#imports'
import { unref, type MaybeRef } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { Project } from '../models/project.model'

export type ProjectIdentityChanges = Partial<
  Pick<Project['identity'], 'name' | 'description' | 'image_url'>
>

export function useProjectUpdate(id: MaybeRef<string | null | undefined>) {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const session = useAppSession()
  const route = useRoute()
  const capture = useCommandScope([
    currentUser, session.appUser, () => route.fullPath,
    () => unref(id),
    () => config.appId,
  ])

  async function updateProject(changes: ProjectIdentityChanges) {
    const isCurrent = capture()
    const projectId = String(unref(id) || '').trim()
    const user = currentUser.value
    const body = { ...changes }
    if (!projectId || !user || user.isAnonymous)
      throw new Error('Sign in and select a Project before editing Identity.')
    const token = await user.getIdToken()
    if (
      !isCurrent() ||
      currentUser.value?.uid !== user.uid ||
      String(unref(id) || '').trim() !== projectId
    )
      throw new Error(
        'The account or selected Project changed. Reopen the editor.'
      )
    const result = await $fetch<{ ok: true; project_id: string }>(
      `/api/internal/control/projects/${encodeURIComponent(projectId)}/identity`,
      {
        method: 'PATCH',
        headers: { authorization: `Bearer ${token}` },
        body,
      }
    )
    if (result?.ok !== true || result.project_id !== projectId)
      throw new Error(
        'Project update response did not match the requested Project.'
      )
    // The existing Project listener observes the committed record.
  }

  return { updateProject }
}
