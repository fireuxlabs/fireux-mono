import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { provideKitchenTeamContext } from './useKitchenTeamContext'
import { useKitchenMemberInvitationCreate } from './mutations/useKitchenMemberInvitationCreate'
import { useKitchenTeamMemberDelete } from './mutations/useKitchenTeamMemberDelete'
import { useKitchenTeamMemberUpdate } from './mutations/useKitchenTeamMemberUpdate'
import { useKitchenCapabilityTools } from '../useKitchenCapabilityTools'

export function useKitchenWorkspaceTeam() {
  const team = provideKitchenTeamContext()
  const capabilityTools = useKitchenCapabilityTools('team')
  const { createKitchenMemberInvitation } = useKitchenMemberInvitationCreate()
  const { updateKitchenTeamMember } = useKitchenTeamMemberUpdate()
  const { deleteKitchenTeamMember } = useKitchenTeamMemberDelete()

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
      activeToolId: capabilityTools.activeToolId.value,
    },
  }))
  const derived = computed(() => ({
    outcome: team.pending.value
      ? ('pending' as const)
      : team.error.value
        ? ('error' as const)
        : team.selectedKitchen.value
          ? ('ready' as const)
          : ('empty' as const),
    hasSelection: Boolean(team.selectedKitchen.value),
    teamMemberLimit: team.teamMemberLimit.value,
    canCreateTeamMember: team.canCreateTeamMember.value,
    teamMemberCapacityReached: team.teamMemberCapacityReached.value,
  }))

  function selectTeamMember(memberId: string) {
    team.selectedTeamMemberId.value = team.selectableTeamMembers.value.some(
      (member) => member.id === memberId
    )
      ? memberId
      : ''
  }

  async function openCreateTeamMember() {
    if (!team.canCreateTeamMember.value) return false
    return capabilityTools.performAction('kitchen.team.create-member')
  }

  async function updateTeamMember(input: {
    memberId: string
    name: string
    role?: 'operator' | 'member'
  }) {
    return updateKitchenTeamMember({
      kitchenId: team.kitchenId.value,
      memberId: input.memberId,
      changes: {
        name: input.name,
        ...(input.role ? { role: input.role } : {}),
      },
    })
  }

  async function deactivateTeamMember(memberId: string) {
    return deleteKitchenTeamMember(team.kitchenId.value, memberId)
  }

  async function createTeamMemberInvitation(memberId: string) {
    return createKitchenMemberInvitation({
      kitchenId: team.kitchenId.value,
      memberId,
    })
  }

  return {
    state,
    derived,
    actions: {
      refresh: team.refresh,
      selectTeamMember,
      openCreateTeamMember,
      closeCreateTeamMember: capabilityTools.closeTool,
      updateTeamMember,
      deactivateTeamMember,
      createTeamMemberInvitation,
    },
  }
}
