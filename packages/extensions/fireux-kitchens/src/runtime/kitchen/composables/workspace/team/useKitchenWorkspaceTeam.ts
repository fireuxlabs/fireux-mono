import { computed, ref, watchEffect } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { defineWorkspaceCapabilityContext } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenTeamData } from './useKitchenTeamData'
import { useKitchenMemberInvitationCreate } from './mutations/useKitchenMemberInvitationCreate'
import { useKitchenTeamMemberDelete } from './mutations/useKitchenTeamMemberDelete'
import { useKitchenTeamMemberUpdate } from './mutations/useKitchenTeamMemberUpdate'
import { useKitchenTeamMemberCreate } from './mutations/useKitchenTeamMemberCreate'

export function useKitchenWorkspaceTeam() {
  const team = useKitchenTeamData()
  const pageState = useWorkspacePageState('kitchen')
  const { createKitchenTeamMember } = useKitchenTeamMemberCreate()
  const { createKitchenMemberInvitation } = useKitchenMemberInvitationCreate()
  const { updateKitchenTeamMember } = useKitchenTeamMemberUpdate()
  const { deleteKitchenTeamMember } = useKitchenTeamMemberDelete()
  const members = computed<WorkspaceTeamMember[]>(() =>
    team.selectableTeamMembers.value.map((member) => ({
      id: member.id,
      userId: member.user_id || '',
      name: member.name || 'Unnamed team member',
      avatar: team.memberAvatarById.value.get(member.id) || '',
      role: member.role,
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
    const ready = status === 'ready'
    const count = members.value.length
    return {
      status,
      capability: defineWorkspaceCapabilityContext({
        id: 'kitchen.team',
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
              Boolean(
                selected && !['owner', 'developer'].includes(selected.role)
              ),
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

  async function createTeamMember(input: { name: string; userId?: string }) {
    if (!team.canCreateTeamMember.value)
      throw new Error('Adding a person is not available.')
    const kitchenId = team.kitchenId.value
    const result = await createKitchenTeamMember({ kitchenId, ...input })
    if (kitchenId === team.kitchenId.value) selectCreatedMember(result.memberId)
    return result
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
    const kitchenId = team.kitchenId.value
    const result = await deleteKitchenTeamMember(kitchenId, memberId)
    if (
      team.kitchenId.value === kitchenId &&
      team.selectedTeamMemberId.value === memberId
    )
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
      create: createTeamMember,
      update: updateTeamMember,
      delete: deactivateTeamMember,
    },
    natives: {
      select: selectTeamMember,
      selectCreated: selectCreatedMember,
      invite: createTeamMemberInvitation,
    },
  }
}
