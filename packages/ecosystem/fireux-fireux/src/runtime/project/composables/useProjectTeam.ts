import type { WorkspaceTeamMemberDocument } from 'fireux-core/runtime/models/workspace-team-member.model'
import { computed, watchEffect } from 'vue'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useTeam } from 'fireux-core/runtime/composables/fireux/useTeam'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/useTeam'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useProjectWorkspace } from './workspace/useProjectWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

type ProjectTeamResponse = {
  ok: true
  project_id: string
  members: WorkspaceTeamMember[]
}

export function useProjectTeam() {
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
  } = useLiveAsyncData<ProjectTeamResponse>(
    requestKey,
    async (liveFetch) => {
      const user = currentUser.value
      const id = projectId.value
      if (!user || !id) {
        return { ok: true, project_id: id, members: [] }
      }
      return liveFetch<ProjectTeamResponse>(
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
    firestoreFetchCollection<WorkspaceTeamMemberDocument>(collectionPath)
  const enrichedById = computed(
    () =>
      new Map<string, WorkspaceTeamMember>(
        (data.value && data.value.project_id === projectId.value
          ? data.value.members
          : []
        ).map((member: WorkspaceTeamMember) => [member.id, member])
      )
  )
  const members = computed<WorkspaceTeamMember[]>(() =>
    (liveMembers.value ?? []).map((member) => {
      const enriched = enrichedById.value.get(member.id)
      return {
        id: member.id,
        userId: enriched?.userId || member.user_id || '',
        name: enriched?.name || member.name || 'Unnamed team member',
        avatar: enriched?.avatar || '',
        roleIds: member.role_ids || [],
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
  const team = useTeam<WorkspaceTeamMember>({
    canWrite,
    members,
    workspaceId: projectId,
    capabilityId: 'project.team',
    pending,
    error,
    memberLimit: teamMemberLimit,
  })

  const pageState = useWorkspacePageState('project')

  const state = computed(() => ({
    project: {
      id: normalizeString(selectedProject.value?.id),
      name: normalizeString(selectedProject.value?.name),
    },
    team: {
      members: team.members.value,
      selectedTeamMemberId: team.selectedTeamMemberId.value,
    },
  }))
  const derived = team.derived

  async function createTeamMember(input: { name: string; userId?: string }) {
    if (!team.canCreateTeamMember.value)
      throw new Error('Adding a person is not available.')
    const targetId = state.value.project.id
    const user = await useRequireUser()
    const result = await $fetch<{ memberId: string; name: string }>(
      `/api/internal/control/projects/${encodeURIComponent(targetId)}/team`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: input,
      }
    )
    if (targetId === projectId.value) team.selectCreated(result.memberId)
    return result
  }

  async function updateTeamMember(input: { memberId: string; name: string }) {
    const targetId = state.value.project.id
    const user = await useRequireUser()
    await $fetch(
      `/api/internal/control/projects/${encodeURIComponent(targetId)}/team/${encodeURIComponent(input.memberId)}`,
      {
        method: 'PATCH',
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: {
          name: input.name,
        },
      }
    )
  }

  async function removeTeamMember(memberId: string) {
    const targetId = state.value.project.id
    const user = await useRequireUser()
    const result = await $fetch<{ name: string }>(
      `/api/internal/control/projects/${encodeURIComponent(targetId)}/team/${encodeURIComponent(memberId)}`,
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
      }
    )
    if (
      targetId === projectId.value &&
      team.selectedTeamMemberId.value === memberId
    )
      team.selectedTeamMemberId.value = ''
    return result
  }

  const context = computed(() => ({
    workspace: { id: projectId.value },
    collection: { records: state.value.team.members },
    selected:
      state.value.team.members.find(
        (member: WorkspaceTeamMember) =>
          member.id === state.value.team.selectedTeamMemberId
      ) ?? null,
    derived: derived.value,
  }))
  watchEffect(() => pageState.publish(context.value))

  return {
    context,
    state,
    derived,
    primitives: {
      create: createTeamMember,
      update: updateTeamMember,
      delete: removeTeamMember,
    },
    natives: { select: team.select, selectCreated: team.selectCreated },
  }
}
