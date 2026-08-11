import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, type ComputedRef } from 'vue'
import { useAuth } from '../../../../firebase/useAuth'
import { useProjectConsole } from '../../core/useProjectConsole'
import type { ProjectSurface } from '../../../../project/useProjectInterface'

export type ProjectTeamMember = {
  id: string
  handle: string
  display_name: string
  avatar: string
  access: 'operator' | 'team'
}

type ProjectTeamResponse = {
  ok: true
  project_id: string
  members: ProjectTeamMember[]
}

type ProjectTeamControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'error' | 'refresh'
>

export type UseProjectConsoleTeamReturn = ProjectTeamControls & {
  selectedProject: ComputedRef<ProjectSurface | null>
  projectId: ComputedRef<string>
  members: ComputedRef<ProjectTeamMember[]>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
}

export function useProjectConsoleTeam(): UseProjectConsoleTeamReturn {
  const { selection, runtime } = useProjectConsole()
  const { currentUser, hasAuthState } = useAuth()
  const requestKey = computed(
    () => `project-team-${selection.projectId.value || 'none'}`
  )
  const {
    data,
    pending: requestPending,
    error,
    refresh,
  } = useAsyncData<ProjectTeamResponse>(
    requestKey,
    async () => {
      const user = currentUser.value
      const projectId = selection.projectId.value
      if (!user || !projectId || runtime.isDemo.value) {
        return { ok: true, project_id: projectId, members: [] }
      }
      return $fetch<ProjectTeamResponse>(
        `/api/internal/control/projects/${encodeURIComponent(projectId)}/team`,
        {
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    {
      server: false,
      watch: [currentUser, hasAuthState, selection.projectId, runtime.isDemo],
    }
  )
  const members = computed(() => data.value?.members ?? [])
  const pending = computed(() => !hasAuthState.value || requestPending.value)

  return {
    selectedProject: selection.project,
    projectId: selection.projectId,
    members,
    count: computed(() => members.value.length),
    pending,
    error,
    refresh,
  }
}
