import { computed, ref, watchEffect } from 'vue'
import { useWorkspacePageState } from '../../../../composables/fireux/workspace/useWorkspacePageState'
import { defineWorkspaceCapabilityContext } from '../../../../composables/fireux/workspace/workspaceCapabilityContext'
import { normalizeString } from '../../../../utils/string'
import { useRequireUser } from '../../../../composables/fireux/firebase/useRequireUser'
import { useProjectTeamData } from './useProjectTeamData'

export function useProjectWorkspaceTeam() {
  const team = useProjectTeamData()
  const pageState = useWorkspacePageState('project')

  const state = computed(() => ({
    project: {
      id: normalizeString(team.selectedProject.value?.id),
      name: normalizeString(team.selectedProject.value?.name),
      tagline: normalizeString(team.selectedProject.value?.description),
      url: normalizeString(team.selectedProject.value?.image_url),
    },
    team: {
      members: team.members.value,
      selectedTeamMemberId: team.selectedTeamMemberId.value,
    },
  }))
  const derived = computed(() => {
    const status = team.pending.value
      ? ('loading' as const)
      : team.error.value
        ? ('error' as const)
        : team.selectedProject.value
          ? ('ready' as const)
          : ('empty' as const)
    const ready = status === 'ready'
    const count = team.members.value.length
    const selected = team.members.value.find(
      (member) => member.id === team.selectedTeamMemberId.value
    )
    return {
      status,
      capability: defineWorkspaceCapabilityContext({
        id: 'project.team',
        subject: 'Team member',
        primitives: {
          create: {
            available: ready && team.canCreateTeamMember.value,
            limit: team.teamMemberLimit.value,
          },
          read: { available: ready && count > 0, count },
          update: {
            available: ready && team.canWrite.value && Boolean(selected),
          },
          delete: {
            available:
              ready &&
              team.canWrite.value &&
              Boolean(selected && selected.role !== 'owner'),
          },
        },
        natives: [
          { id: 'link-existing-user', primitive: 'create' },
          { id: 'add-unlinked-name', primitive: 'create' },
          { id: 'enrich-linked-identity', primitive: 'read' },
        ],
      }),
    }
  })

  const createdSelection = ref<{ projectId: string; memberId: string } | null>(
    null
  )
  watchEffect(() => {
    const target = createdSelection.value
    if (!target) return
    if (target.projectId !== team.projectId.value) {
      createdSelection.value = null
      return
    }
    if (team.members.value.some((member) => member.id === target.memberId)) {
      team.selectedTeamMemberId.value = target.memberId
      createdSelection.value = null
    }
  })
  function selectCreated(memberId: string) {
    createdSelection.value = { projectId: team.projectId.value, memberId }
  }
  function selectTeamMember(memberId: string) {
    team.selectedTeamMemberId.value = team.members.value.some(
      (member) => member.id === memberId
    )
      ? memberId
      : ''
  }

  async function createTeamMember(input: {
    name: string
    userId?: string
    jobTitle?: string
  }) {
    const projectId = state.value.project.id
    const user = await useRequireUser()
    const result = await $fetch<{ memberId: string; name: string }>(
      `/api/internal/control/projects/${encodeURIComponent(projectId)}/team`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: input,
      }
    )
    return result
  }

  async function updateTeamMember(input: {
    memberId: string
    name: string
    jobTitle?: string
    role?: 'operator' | 'member'
  }) {
    const projectId = state.value.project.id
    const user = await useRequireUser()
    await $fetch(
      `/api/internal/control/projects/${encodeURIComponent(projectId)}/team/${encodeURIComponent(input.memberId)}`,
      {
        method: 'PATCH',
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: {
          name: input.name,
          ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
          ...(input.role ? { role: input.role } : {}),
        },
      }
    )
  }

  async function deactivateTeamMember(memberId: string) {
    const projectId = state.value.project.id
    const user = await useRequireUser()
    const result = await $fetch<{ name: string }>(
      `/api/internal/control/projects/${encodeURIComponent(projectId)}/team/${encodeURIComponent(memberId)}`,
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
      }
    )
    team.selectedTeamMemberId.value = ''
    return result
  }

  watchEffect(() => {
    pageState.publish({
      project: state.value.project,
      team: state.value.team,
      derived: derived.value,
    })
  })

  return {
    state,
    derived,
    primitives: {
      create: createTeamMember,
      update: updateTeamMember,
      delete: deactivateTeamMember,
    },
    natives: { select: selectTeamMember, selectCreated },
  }
}
