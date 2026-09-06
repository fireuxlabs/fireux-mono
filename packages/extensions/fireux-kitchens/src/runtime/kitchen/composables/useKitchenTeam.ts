import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import type { WorkspaceTeamMemberDocument } from 'fireux-core/runtime/models/workspace-team-member.model'
import { computed, watchEffect } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useTeam } from 'fireux-core/runtime/composables/fireux/useTeam'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { kitchenTeamMemberLimit } from '../utils/team.ts'
import { useKitchenWorkspace } from './workspace/core/useKitchenWorkspace'
import { useKitchenChildCollection } from './firestore/utils/paths/useKitchenChildCollection'
import { useAsyncData } from '#imports'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/useTeam'
import { useKitchenMemberInvitationCreate } from './team/mutations/useKitchenMemberInvitationCreate'

type KitchenTeamResponse = {
  ok: true
  kitchenId: string
  canManageTeam: boolean
  members: Array<{
    memberId: string
    name: string
    avatar: string
    userId: string
    linked: boolean
  }>
}

export function useKitchenTeam() {
  const appSession = useAppSession()
  const { currentUser, hasAuthState } = useAuth()
  const membership = appSession.appUser
  const fireux = useFireUXConfig()
  const workspace = useKitchenWorkspace()
  const selectedKitchen = workspace.data
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')

  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const liveTeam = useKitchenChildCollection<WorkspaceTeamMemberDocument>(
    'team',
    fetchKitchenId,
    {
      kitchenCollectionPath: rootCollection,
      databaseId,
    }
  )
  const requestKey = computed(
    () =>
      `kitchen-team-${currentUser.value?.uid || 'anonymous'}-${fetchKitchenId.value || 'none'}`
  )
  const { data: teamResponse, error: teamError } =
    useAsyncData<KitchenTeamResponse>(
      requestKey,
      async () => {
        const user = currentUser.value
        const kitchenId = fetchKitchenId.value
        if (!user || !kitchenId)
          return { ok: true, kitchenId: '', canManageTeam: false, members: [] }
        return $fetch<KitchenTeamResponse>(
          '/api/workspace/kitchen/team/members',
          {
            query: { kitchenId },
            headers: { authorization: `Bearer ${await user.getIdToken()}` },
          }
        )
      },
      {
        server: false,
        watch: [currentUser, hasAuthState, fetchKitchenId],
      }
    )
  const canWrite = computed(
    () =>
      !teamError.value &&
      teamResponse.value?.kitchenId === kitchenId.value &&
      teamResponse.value?.canManageTeam === true
  )
  const projectedMembersById = computed(
    () =>
      new Map<string, KitchenTeamResponse['members'][number]>(
        (teamResponse.value?.kitchenId === kitchenId.value
          ? teamResponse.value.members
          : []
        ).map((member: KitchenTeamResponse['members'][number]) => [
          member.memberId,
          member,
        ])
      )
  )
  const teamMembers = computed<
    Array<WorkspaceTeamMemberDocument & { avatar: string }>
  >(() =>
    liveTeam.items.value.map((member) => {
      const projected = projectedMembersById.value.get(member.id)
      return {
        ...member,
        id: member.id,
        user_id: projected?.userId || member.user_id,
        name: projected?.name || member.name,
        avatar: projected?.avatar || '',
      }
    })
  )
  const memberAvatarById = computed(
    () => new Map(teamMembers.value.map((member) => [member.id, member.avatar]))
  )
  const selectableTeamMembers = teamMembers
  const subscription = computed(() => membership.value?.subscription || 'free')
  const teamMemberLimit = computed(() =>
    kitchenTeamMemberLimit(fireux.subscriptionCapacity, subscription.value)
  )
  const pending = computed(
    () =>
      !hasAuthState.value ||
      (!workspace.data.value && workspace.outcome.value === 'pending') ||
      liveTeam.pending.value
  )
  const error = computed(
    () =>
      liveTeam.error.value ??
      teamError.value ??
      appSession.error.value ??
      (workspace.outcome.value === 'error'
        ? new Error('Kitchen workspace could not be read.')
        : undefined) ??
      undefined
  )
  const team = useTeam({
    canWrite,
    members: selectableTeamMembers,
    workspaceId: kitchenId,
    capabilityId: 'kitchen.team',
    pending,
    error,
    memberLimit: teamMemberLimit,
  })
  const pageState = useWorkspacePageState('kitchen')
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { createKitchenMemberInvitation } = useKitchenMemberInvitationCreate()
  const members = computed<WorkspaceTeamMember[]>(() =>
    selectableTeamMembers.value.map((member) => ({
      id: member.id,
      userId: member.user_id || '',
      name: member.name || 'Unnamed team member',
      avatar: memberAvatarById.value.get(member.id) || '',
      roleIds: member.role_ids,
    }))
  )

  const state = computed(() => ({
    kitchen: {
      id: normalizeString(selectedKitchen.value?.id),
      name: normalizeString(selectedKitchen.value?.identity?.display_name),
    },
    team: {
      members: members.value,
      selectedTeamMemberId: team.selectedTeamMemberId.value,
    },
  }))
  const derived = team.derived

  async function createTeamMember(input: { name: string; userId?: string }) {
    if (!team.canCreateTeamMember.value)
      throw new Error('Adding a person is not available.')
    requireWritableData()
    const targetId = kitchenId.value
    const user = await useRequireUser()
    const result = await $fetch<{ ok: true; memberId: string; name: string }>(
      '/api/workspace/kitchen/team/members',
      {
        method: 'POST',
        timeout: 15000,
        retry: 0,
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: {
          kitchenId: targetId,
          name: input.name.trim(),
          userId: input.userId?.trim() || '',
        },
      }
    )
    if (result.ok !== true || !result.memberId)
      throw new Error('Add team member response was invalid.')
    if (targetId === kitchenId.value) team.selectCreated(result.memberId)
    return result
  }

  async function updateTeamMember(input: { memberId: string; name: string }) {
    requireWritableData()
    const user = await useRequireUser()
    const result = await $fetch<{ ok: true; memberId: string; name: string }>(
      `/api/workspace/kitchen/team/members/${encodeURIComponent(input.memberId)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: {
          kitchenId: kitchenId.value,
          changes: { name: input.name.trim() },
        },
      }
    )
    if (result.ok !== true || result.memberId !== input.memberId)
      throw new Error('Update team member response was invalid.')
    return result
  }

  async function removeTeamMember(memberId: string) {
    requireWritableData()
    const targetId = kitchenId.value
    const user = await useRequireUser()
    const result = await $fetch<{ ok: true; memberId: string; name: string }>(
      `/api/workspace/kitchen/team/members/${encodeURIComponent(memberId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        query: { kitchenId: targetId },
      }
    )
    if (
      kitchenId.value === targetId &&
      team.selectedTeamMemberId.value === memberId
    )
      team.selectedTeamMemberId.value = ''
    return result
  }

  async function createTeamMemberInvitation(memberId: string) {
    return createKitchenMemberInvitation({
      kitchenId: kitchenId.value,
      memberId,
    })
  }

  const context = computed(() => ({
    workspace: { id: kitchenId.value },
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
    teamMembers,
    pending,
    state,
    derived,
    primitives: {
      create: createTeamMember,
      update: updateTeamMember,
      delete: removeTeamMember,
    },
    natives: {
      select: team.select,
      selectCreated: team.selectCreated,
      invite: createTeamMemberInvitation,
    },
  }
}
