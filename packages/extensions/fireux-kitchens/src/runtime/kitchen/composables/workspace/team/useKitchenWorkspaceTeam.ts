import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { provideKitchenTeamContext } from './useKitchenTeamContext'

export function useKitchenWorkspaceTeam() {
  const team = provideKitchenTeamContext()

  const state = computed(() => ({
    kitchen: {
      id: normalizeString(team.selectedKitchen.value?.id),
      name: normalizeString(team.selectedKitchen.value?.identity?.display_name),
      tagline: normalizeString(team.selectedKitchen.value?.identity?.tagline),
      url: normalizeString(team.selectedKitchen.value?.identity?.image_url),
    },
    team: {
      members: team.selectableTeamMembers.value,
      selectedTeamMemberId: team.selectedTeamMemberId.value,
    },
  }))
  const derived = computed(() => ({
    outcome: team.pending.value
      ? ('pending' as const)
      : team.selectedKitchen.value
        ? ('ready' as const)
        : ('empty' as const),
    hasSelection: Boolean(team.selectedKitchen.value),
    teamMemberLimit: team.teamMemberLimit.value,
    canCreateTeamMember: team.canCreateTeamMember.value,
    teamMemberCapacityReached: team.teamMemberCapacityReached.value,
  }))

  return { state, derived, actions: { refresh: team.refresh } }
}
