import { computed, watchEffect } from 'vue'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useWorkspaceTeam } from 'fireux-core/runtime/workspace/composables/useWorkspaceTeam'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/workspace/composables/useWorkspaceTeam'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useProjectWorkspace } from './workspace/useProjectWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'

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
  const members = computed<WorkspaceTeamMember[]>(() =>
    !requestError.value && data.value?.project_id === projectId.value
      ? data.value.members
      : []
  )
  const pending = computed(
    () =>
      !hasAuthState.value ||
      appSession.pending.value ||
      workspace.outcome.value === 'pending' ||
      (Boolean(projectId.value) &&
        (requestPending.value || data.value?.project_id !== projectId.value))
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
  const team = useWorkspaceTeam<WorkspaceTeamMember>({
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
      name: normalizeString(selectedProject.value?.identity.name),
    },
    team: {
      members: team.members.value,
      selectedTeamMemberId: team.selectedTeamMemberId.value,
    },
  }))
  const derived = team.derived

  async function createTeamMember(input: { name: string; userId?: string }) {
    input = { ...input }
    if (!team.canCreateTeamMember.value)
      throw new Error('Adding a person is not available.')
    const targetId = state.value.project.id
    if (!targetId)
      throw new Error('Select a Project before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    const result = await $fetch<{ memberId: string; name: string }>(
      `/api/internal/control/projects/${encodeURIComponent(targetId)}/team`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: input,
      }
    )
    if (targetId === projectId.value) team.selectCreated(result.memberId)
    return result
  }

  async function updateTeamMember(input: { memberId: string; name: string }) {
    input = { ...input }
    const targetId = state.value.project.id
    if (!targetId)
      throw new Error('Select a Project before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    await $fetch(
      `/api/internal/control/projects/${encodeURIComponent(targetId)}/team/${encodeURIComponent(input.memberId)}`,
      {
        method: 'PATCH',
        headers: { authorization: `Bearer ${token}` },
        body: {
          name: input.name,
        },
      }
    )
  }

  async function removeTeamMember(memberId: string) {
    const targetId = state.value.project.id
    if (!targetId)
      throw new Error('Select a Project before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    const result = await $fetch<{ name: string }>(
      `/api/internal/control/projects/${encodeURIComponent(targetId)}/team/${encodeURIComponent(memberId)}`,
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
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
    workspaceId: projectId,
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
