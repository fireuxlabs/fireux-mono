import { computed, watchEffect } from 'vue'
import { useWorkspacePageState } from '../../../../composables/fireux/workspace/useWorkspacePageState'
import { normalizeString } from '../../../../utils/string'
import { provideProjectTeamContext } from './useProjectTeamContext'

export function useProjectWorkspaceTeam() {
  const team = provideProjectTeamContext()
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
  const derived = computed(() => ({
    status: team.pending.value
      ? ('loading' as const)
      : team.error.value
        ? ('error' as const)
        : team.selectedProject.value
          ? ('ready' as const)
          : ('empty' as const),
    create: {
      allowed: team.canCreateTeamMember.value,
      limit: team.teamMemberLimit.value,
    },
  }))

  function selectTeamMember(memberId: string) {
    team.selectedTeamMemberId.value = team.members.value.some(
      (member) => member.id === memberId
    )
      ? memberId
      : ''
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
    actions: { refresh: team.refresh, selectTeamMember },
  }
}
