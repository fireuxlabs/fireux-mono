import { useAsyncData } from '#imports'
import {
  computed,
  inject,
  provide,
  ref,
  watchEffect,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { useCurrentAppContext } from '../../../../app/composables/useCurrentAppContext'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import type { AppUserSubscription } from '../../../../app/models/app-user.model'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from '../../../../app/utils/app-subscription-capacity'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export type ProjectTeamMemberSummary = {
  id: string
  handle: string
  display_name: string
  avatar: string
  access: 'operator' | 'team'
}

type ProjectTeamResponse = {
  ok: true
  project_id: string
  members: ProjectTeamMemberSummary[]
}

type ProjectWorkspace = ReturnType<typeof useProjectWorkspace>

export type ProjectWorkspaceTeam = {
  selectedProject: ProjectWorkspace['selection']['project']
  projectId: ProjectWorkspace['selection']['projectId']
  members: ComputedRef<ProjectTeamMemberSummary[]>
  count: ComputedRef<number>
  selectedTeamMember: ComputedRef<ProjectTeamMemberSummary | null>
  selectedTeamMemberId: Ref<string>
  subscription: ComputedRef<AppUserSubscription>
  teamMemberLimit: ComputedRef<number | null>
  canAddTeamMember: ComputedRef<boolean>
  pending: ComputedRef<boolean>
  error: Ref<Error | undefined>
  refresh: () => Promise<void>
}

function createProjectWorkspaceTeam(): ProjectWorkspaceTeam {
  const { selection, runtime } = useProjectWorkspace()
  const { currentUser, hasAuthState } = useAuth()
  const { membership } = useCurrentAppContext()
  const fireux = useFireUXConfig()
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
  const selectedTeamMemberId = ref('')
  const selectedTeamMember = computed(
    () =>
      members.value.find(
        (member: ProjectTeamMemberSummary) =>
          member.id === selectedTeamMemberId.value
      ) ?? null
  )
  const subscription = computed(
    () => membership.value?.subscription || 'free'
  )
  const teamMemberLimit = computed(() =>
    appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'project.team',
      subscription.value
    )
  )
  const canAddTeamMember = computed(() =>
    hasAppSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'project.team',
      subscription.value,
      members.value.length
    )
  )

  watchEffect(() => {
    if (selectedTeamMember.value) return
    selectedTeamMemberId.value = members.value[0]?.id || ''
  })

  return {
    selectedProject: selection.project,
    projectId: selection.projectId,
    members,
    count: computed(() => members.value.length),
    selectedTeamMember,
    selectedTeamMemberId,
    subscription,
    teamMemberLimit,
    canAddTeamMember,
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
