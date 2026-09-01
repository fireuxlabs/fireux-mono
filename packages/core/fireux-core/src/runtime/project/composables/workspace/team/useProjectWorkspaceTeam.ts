import { computed } from 'vue'
import { normalizeString } from '../../../../utils/string'
import { provideProjectTeamContext } from './useProjectTeamContext'

export function useProjectWorkspaceTeam() {
  const team = provideProjectTeamContext()

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
  const derived = computed(() => ({
    outcome: team.pending.value
      ? ('pending' as const)
      : team.error.value
        ? ('error' as const)
        : team.selectedProject.value
          ? ('ready' as const)
          : ('empty' as const),
    error: team.error.value?.message || '',
    hasSelection: Boolean(team.selectedProject.value),
    teamMemberLimit: team.teamMemberLimit.value,
    canCreateTeamMember: team.canCreateTeamMember.value,
    teamMemberCapacityReached: team.teamMemberCapacityReached.value,
  }))

  function selectTeamMember(memberId: string) {
    team.selectedTeamMemberId.value = team.members.value.some(
      (member) => member.id === memberId
    )
      ? memberId
      : ''
  }

  return {
    state,
    derived,
    actions: { refresh: team.refresh, selectTeamMember },
  }
}
