import { computed, ref, watchEffect } from 'vue'
import { kitchenTeamOnboarding } from '../../../models/team-onboarding'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { defineWorkspaceCapabilityContext } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenTeamData } from './useKitchenTeamData'
import { useKitchenMemberInvitationCreate } from './mutations/useKitchenMemberInvitationCreate'
import { useKitchenTeamMemberDelete } from './mutations/useKitchenTeamMemberDelete'
import { useKitchenTeamMemberUpdate } from './mutations/useKitchenTeamMemberUpdate'
import { useKitchenCapabilityTools } from '../useKitchenCapabilityTools'

export function useKitchenWorkspaceTeam() {
  const team = useKitchenTeamData()
  const pageState = useWorkspacePageState('kitchen')
  const capabilityTools = useKitchenCapabilityTools('team')
  const { createKitchenMemberInvitation } = useKitchenMemberInvitationCreate()
  const { updateKitchenTeamMember } = useKitchenTeamMemberUpdate()
  const { deleteKitchenTeamMember } = useKitchenTeamMemberDelete()
  const members = computed<(WorkspaceTeamMember & { jobTitle: string })[]>(() =>
    team.selectableTeamMembers.value.map((member) => ({
      id: member.id,
      userId: member.user_id || '',
      name: member.name || 'Unnamed team member',
      avatar: team.memberAvatarById.value.get(member.id) || '',
      role: member.role,
      jobTitle: member.job_title || '',
      status: member.status,
    }))
  )

  const state = computed(() => ({
    kitchen: {
      id: normalizeString(team.selectedKitchen.value?.id),
      name: normalizeString(team.selectedKitchen.value?.identity?.display_name),
      tagline: normalizeString(team.selectedKitchen.value?.identity?.tagline),
      url: normalizeString(team.selectedKitchen.value?.identity?.image_url),
    },
    team: {
      members: members.value,
      selectedTeamMemberId: team.selectedTeamMemberId.value,
      activeToolId: capabilityTools.activeToolId.value,
    },
  }))
  const derived = computed(() => {
    const status = team.error.value
      ? ('error' as const)
      : team.pending.value
        ? ('loading' as const)
        : team.selectedKitchen.value
          ? ('ready' as const)
          : ('empty' as const)
    const selected = members.value.find(
      (member) => member.id === team.selectedTeamMemberId.value
    )
    const count = members.value.length
    return {
      status,
      compounds: [
        {
          id: kitchenTeamOnboarding.id,
          available: team.canCreateTeamMember.value,
          steps: ['create-member', 'update-member', 'create-member-invitation'],
        },
      ],
      capability: defineWorkspaceCapabilityContext({
        id: 'kitchen.team',
        subject: 'Team member',
        primitives: {
          create: {
            available: team.canCreateTeamMember.value,
            limit: team.teamMemberLimit.value,
          },
          read: { available: count > 0, count },
          update: { available: team.canWrite.value && Boolean(selected) },
          delete: {
            available:
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

  const createdSelection = ref<{ kitchenId: string; memberId: string } | null>(
    null
  )
  watchEffect(() => {
    const target = createdSelection.value
    if (!target) return
    if (target.kitchenId !== team.kitchenId.value) {
      createdSelection.value = null
      return
    }
    if (members.value.some((member) => member.id === target.memberId)) {
      team.selectedTeamMemberId.value = target.memberId
      createdSelection.value = null
    }
  })
  function selectCreatedMember(memberId: string) {
    createdSelection.value = { kitchenId: team.kitchenId.value, memberId }
  }

  function selectTeamMember(memberId: string) {
    team.selectedTeamMemberId.value = members.value.some(
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
    jobTitle?: string
  }) {
    const result = await updateKitchenTeamMember({
      kitchenId: team.kitchenId.value,
      memberId: input.memberId,
      changes: {
        name: input.name,
        ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
        ...(input.role ? { role: input.role } : {}),
      },
    })
    return result
  }

  async function deactivateTeamMember(memberId: string) {
    const result = await deleteKitchenTeamMember(team.kitchenId.value, memberId)
    team.selectedTeamMemberId.value = ''
    return result
  }

  async function createTeamMemberInvitation(memberId: string) {
    return createKitchenMemberInvitation({
      kitchenId: team.kitchenId.value,
      memberId,
    })
  }

  watchEffect(() => {
    pageState.publish({
      kitchen: state.value.kitchen,
      team: state.value.team,
      derived: derived.value,
    })
  })

  return {
    state,
    derived,
    primitives: {
      update: updateTeamMember,
      delete: deactivateTeamMember,
    },
    natives: {
      select: selectTeamMember,
      selectCreated: selectCreatedMember,
      openCreate: openCreateTeamMember,
      closeCreate: capabilityTools.closeTool,
      invite: createTeamMemberInvitation,
    },
  }
}
