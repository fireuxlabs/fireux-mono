import { refreshNuxtData } from 'nuxt/app'
import { useRoute } from '#imports'
import type { WatchSource } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { Project } from '../models/project.model'

export type ProjectIdentityChanges = Partial<
  Pick<Project['identity'], 'name' | 'description' | 'image_url'>
>

export function useProjectUpdate(sources: WatchSource[] = []) {
  const { currentUser } = useAuth()
  const session = useAppSession()
  const config = useFireUXConfig()
  const route = useRoute()
  const capture = useCommandScope([
    () => currentUser.value?.uid,
    session.appUser,
    () => config.appId,
    () => route.fullPath,
    ...sources,
  ])

  async function updateProject(input: {
    projectId: string
    changes: ProjectIdentityChanges
  }) {
    const projectId = String(input.projectId || '').trim()
    const changes = { ...input.changes }
    const user = currentUser.value
    if (!projectId || !user || user.isAnonymous)
      throw new Error('Sign in and select a Project before editing Identity.')
    const isCurrent = capture()
    const token = await user.getIdToken()
    if (!isCurrent())
      throw new Error('The Project or account context changed. Try again.')
    const result = await $fetch<{ ok: true; project_id: string }>(
      `/api/internal/control/projects/${encodeURIComponent(projectId)}/identity`,
      {
        onResponse: async ({ options, response }) => {
          if (
            response.ok &&
            !['GET', 'HEAD'].includes(
              String(options.method || 'GET').toUpperCase()
            )
          )
            await refreshNuxtData()
        },
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
