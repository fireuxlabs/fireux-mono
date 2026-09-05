import { useAsyncData } from '#imports'
import { computed, type ComputedRef, type Ref } from 'vue'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { readRuntimeFirestoreDatabaseId } from '../../../../composables/fireux/firestore/vuefire'
import { useFirestoreRead } from '../../../../composables/fireux/firestore/operations/useFirestoreRead'
import { useAppSession } from '../../../../app/composables/useAppSession'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import type { AppUserSubscription } from '../../../../app/models/app-user.model'
import { appSubscriptionCapacity } from '../../../../app/utils/app-subscription-capacity'
import { useTeam } from '../../../../composables/fireux/workspace/useTeam'
import type { WorkspaceTeamMember } from '../../../../composables/fireux/workspace/useTeam'
import { normalizeString } from '../../../../utils/string'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export type ProjectTeamMemberSummary = WorkspaceTeamMember

type ProjectTeamResponse = {
  ok: true
  project_id: string
  members: ProjectTeamMemberSummary[]
}
type ProjectTeamRecord = {
  id: string
  user_id?: string
  name?: string
  avatar?: string
  role?: WorkspaceTeamMember['role']
  status?: WorkspaceTeamMember['status']
}

export type ProjectWorkspaceTeam = {
  selectedProject: ReturnType<typeof useProjectWorkspace>['data']
  projectId: ComputedRef<string>
  members: ComputedRef<readonly ProjectTeamMemberSummary[]>
  count: ComputedRef<number>
  selectedTeamMember: ComputedRef<ProjectTeamMemberSummary | null>
  selectedTeamMemberId: Ref<string>
  subscription: ComputedRef<AppUserSubscription>
  teamMemberLimit: ComputedRef<number | null>
  canWrite: ComputedRef<boolean>
  canCreateTeamMember: ComputedRef<boolean>
  teamMemberCapacityReached: ComputedRef<boolean>
  pending: ComputedRef<boolean>
  error: ComputedRef<Error | undefined>
}

export function useProjectTeamData(): ProjectWorkspaceTeam {
  const { currentUser, hasAuthState } = useAuth()
  const appSession = useAppSession()
  const membership = appSession.appUser
  const workspace = useProjectWorkspace()
  const fireux = useFireUXConfig()
  const selectedProject = workspace.data
  const projectId = computed(() => normalizeString(selectedProject.value?.id))

  const requestKey = computed(
    () =>
      `project-team-${currentUser.value?.uid || 'anonymous'}-${projectId.value || 'none'}`
  )
  const {
    data,
    pending: requestPending,
    error: requestError,
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
  const collectionPath = computed(() =>
    projectId.value ? `projects/${projectId.value}/team` : ''
  )
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: computed(() => readRuntimeFirestoreDatabaseId() || ''),
  })
  const liveMembers =
    firestoreFetchCollection<ProjectTeamRecord>(collectionPath)
  const enrichedById = computed(
    () =>
      new Map<string, ProjectTeamMemberSummary>(
        (data.value?.project_id === projectId.value
          ? data.value.members
          : []
        ).map((member: ProjectTeamMemberSummary) => [member.id, member])
      )
  )
  const members = computed<ProjectTeamMemberSummary[]>(() =>
    (liveMembers.value ?? []).map((member) => {
      const enriched = enrichedById.value.get(member.id)
      return {
        id: member.id,
        userId: enriched?.userId || member.user_id || '',
        name: enriched?.name || member.name || 'Unnamed team member',
        avatar: enriched?.avatar || member.avatar || '',
        role: member.role || 'member',
        status: member.status || 'active',
      }
    })
  )
  const pending = computed(
    () =>
      !hasAuthState.value ||
      appSession.pending.value ||
      workspace.outcome.value === 'pending' ||
      requestPending.value ||
      liveMembers.value === undefined
  )
  const error = computed<Error | undefined>(() => {
    const cause =
      requestError.value ??
      appSession.error.value ??
      (workspace.outcome.value === 'error'
        ? new Error('Project workspace could not be read.')
        : undefined)
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
  const canWrite = computed(() =>
    Boolean(
      currentUser.value &&
        selectedProject.value &&
        !pending.value &&
        !error.value &&
        data.value?.ok &&
        data.value.project_id === projectId.value
    )
  )
  const team = useTeam<ProjectTeamMemberSummary>({
    canWrite,
    members,
    settled: computed(() => !pending.value && !error.value),
    memberLimit: teamMemberLimit,
  })

  return {
    selectedProject,
    projectId,
    members: team.members,
    count: team.count,
    selectedTeamMember: team.selectedTeamMember,
    selectedTeamMemberId: team.selectedTeamMemberId,
    subscription,
    teamMemberLimit: team.memberLimit,
    canWrite,
    canCreateTeamMember: team.canCreateTeamMember,
    teamMemberCapacityReached: team.teamMemberCapacityReached,
    pending,
    error,
  }
}
