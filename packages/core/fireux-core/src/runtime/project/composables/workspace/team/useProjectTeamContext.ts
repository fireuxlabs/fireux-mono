import { useAsyncData } from '#imports'
import {
  computed,
  inject,
  nextTick,
  provide,
  watch,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { useCurrentAppContext } from '../../../../app/composables/useCurrentAppContext'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import type { AppUserSubscription } from '../../../../app/models/app-user.model'
import { appSubscriptionCapacity } from '../../../../app/utils/app-subscription-capacity'
import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { useTeam } from '../../../../composables/fireux/workspace/useTeam'
import type { WorkspaceTeamMember } from '../../../../composables/fireux/workspace/useTeam'
import { normalizeString } from '../../../../utils/string'
import type { Project } from '../../../models/project.model'
import { useProjectDetail } from '../../useProjectDetail'

export type ProjectTeamMemberSummary = WorkspaceTeamMember

type ProjectTeamResponse = {
  ok: true
  project_id: string
  members: ProjectTeamMemberSummary[]
}

export type ProjectWorkspaceTeam = {
  selectedProject: ReturnType<typeof useProjectDetail>['project']
  projectId: ComputedRef<string>
  members: ComputedRef<readonly ProjectTeamMemberSummary[]>
  count: ComputedRef<number>
  selectedTeamMember: ComputedRef<ProjectTeamMemberSummary | null>
  selectedTeamMemberId: Ref<string>
  subscription: ComputedRef<AppUserSubscription>
  teamMemberLimit: ComputedRef<number | null>
  canCreateTeamMember: ComputedRef<boolean>
  teamMemberCapacityReached: ComputedRef<boolean>
  pending: ComputedRef<boolean>
  error: ComputedRef<Error | undefined>
  refresh: () => Promise<void>
}

function createProjectWorkspaceTeam(): ProjectWorkspaceTeam {
  const { currentUser, hasAuthState } = useAuth()
  const appContext = useCurrentAppContext()
  const membership = appContext.membership
  const workspace = useWorkspace('project')
  const fireux = useFireUXConfig()
  const primaryProjectId = computed(
    () => membership.value?.primary_project || ''
  )
  const current = useProjectDetail(primaryProjectId)
  const selectedProject = current.project
  const projectId = computed(() => normalizeString(selectedProject.value?.id))

  watch(
    [primaryProjectId, selectedProject],
    ([primaryId, project]: [string, Project | null]) => {
      if (!primaryId || project?.id !== primaryId) {
        if (!primaryId) workspace.clearActive()
        return
      }
      workspace.activate(
        normalizeString(project.id),
        normalizeString(project.name),
        normalizeString(project.description),
        normalizeString(project.image_url)
      )
      workspace.setActiveStatus(project.status || '')
    },
    { immediate: true }
  )

  const requestKey = computed(
    () =>
      `project-team-${currentUser.value?.uid || 'anonymous'}-${projectId.value || 'none'}`
  )
  const {
    data,
    pending: requestPending,
    error: requestError,
    refresh: refreshTeam,
  } = useAsyncData<ProjectTeamResponse>(
    requestKey,
    async () => {
      const user = currentUser.value
      const id = projectId.value
      if (!user || !id) {
        return { ok: true, project_id: id, members: [] }
      }
      return $fetch<ProjectTeamResponse>(
        `/api/internal/control/projects/${encodeURIComponent(id)}/team`,
        {
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    {
      server: false,
      watch: [currentUser, hasAuthState, projectId],
    }
  )
  const members = computed(() => data.value?.members ?? [])
  const pending = computed(
    () =>
      !hasAuthState.value ||
      appContext.pending.value ||
      current.pending.value ||
      requestPending.value
  )
  const error = computed<Error | undefined>(() => {
    const cause =
      requestError.value ?? appContext.error.value ?? current.error.value
    if (!cause) return undefined
    return cause instanceof Error ? cause : new Error(String(cause))
  })
  const subscription = computed(() => membership.value?.subscription || 'free')
  const teamMemberLimit = computed(() =>
    appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'project.team',
      subscription.value
    )
  )
  const team = useTeam<ProjectTeamMemberSummary>({
    target: selectedProject,
    targetId: projectId,
    readOnly: computed(() => false),
    canWrite: computed(
      () => Boolean(currentUser.value && selectedProject.value && !error.value)
    ),
    members,
    memberLimit: teamMemberLimit,
  })

  async function refresh() {
    await appContext.refresh()
    await nextTick()
    await current.refresh()
    await refreshTeam()
  }

  return {
    selectedProject,
    projectId,
    members: team.members,
    count: team.count,
    selectedTeamMember: team.selectedTeamMember,
    selectedTeamMemberId: team.selectedTeamMemberId,
    subscription,
    teamMemberLimit: team.memberLimit,
    canCreateTeamMember: team.canCreateTeamMember,
    teamMemberCapacityReached: team.teamMemberCapacityReached,
    pending,
    error,
    refresh,
  }
}

const projectWorkspaceTeamKey: InjectionKey<ProjectWorkspaceTeam> = Symbol(
  'fireux-project-workspace-team'
)

export function provideProjectTeamContext() {
  const workspace = createProjectWorkspaceTeam()
  provide(projectWorkspaceTeamKey, workspace)
  return workspace
}

export function useProjectTeamContext(): ProjectWorkspaceTeam {
  return inject(projectWorkspaceTeamKey, null) ?? createProjectWorkspaceTeam()
}
