import { computed, watchEffect } from 'vue'
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
            available: team.canCreateTeamMember.value,
            limit: team.teamMemberLimit.value,
          },
          read: { available: count > 0, count },
          update: { available: Boolean(selected) },
          delete: { available: Boolean(selected && selected.role !== 'owner') },
        },
        natives: [
          { id: 'link-existing-user', primitive: 'create' },
          { id: 'add-unlinked-name', primitive: 'create' },
          { id: 'enrich-linked-identity', primitive: 'read' },
        ],
      }),
    }
  })

  function selectTeamMember(memberId: string) {
    team.selectedTeamMemberId.value = team.members.value.some(
      (member) => member.id === memberId
    )
      ? memberId
      : ''
  }

  async function createTeamMember(input: { name: string; userId?: string }) {
    const user = await useRequireUser()
    const result = await $fetch<{ memberId: string; name: string }>(
      `/api/internal/control/projects/${encodeURIComponent(state.value.project.id)}/team`,
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
    role?: 'operator' | 'member'
  }) {
    const user = await useRequireUser()
    await $fetch(
      `/api/internal/control/projects/${encodeURIComponent(state.value.project.id)}/team/${encodeURIComponent(input.memberId)}`,
      {
        method: 'PATCH',
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: { name: input.name, ...(input.role ? { role: input.role } : {}) },
      }
    )
  }

  async function deactivateTeamMember(memberId: string) {
    const user = await useRequireUser()
    const result = await $fetch<{ name: string }>(
      `/api/internal/control/projects/${encodeURIComponent(state.value.project.id)}/team/${encodeURIComponent(memberId)}`,
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
    natives: { select: selectTeamMember },
  }
}
