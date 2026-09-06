import { computed, watchEffect } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useTeam } from 'fireux-core/runtime/composables/fireux/useTeam'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  KitchenTeamMemberDefaults,
  type KitchenTeamMember,
} from '../utils/team.ts'
import { kitchenTeamMemberLimit } from '../utils/team.ts'
import { useKitchenWorkspace } from './workspace/core/useKitchenWorkspace'
import { useKitchenTeamMemberCollection } from './team/fetch/useKitchenTeamMemberCollection'
import { useAsyncData } from '#imports'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/useTeam'
import { useKitchenMemberInvitationCreate } from './team/mutations/useKitchenMemberInvitationCreate'
import { useKitchenTeamMemberDelete } from './team/mutations/useKitchenTeamMemberDelete'
import { useKitchenTeamMemberUpdate } from './team/mutations/useKitchenTeamMemberUpdate'
import { useKitchenTeamMemberCreate } from './team/mutations/useKitchenTeamMemberCreate'

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
  const liveTeam = useKitchenTeamMemberCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
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
  const teamMembers = computed<Array<KitchenTeamMember & { avatar: string }>>(
    () =>
      liveTeam.kitchenTeamMembers.value.map((member) => {
        const projected = projectedMembersById.value.get(member.id)
        return {
          ...KitchenTeamMemberDefaults,
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
  const { createKitchenTeamMember } = useKitchenTeamMemberCreate()
  const { createKitchenMemberInvitation } = useKitchenMemberInvitationCreate()
  const { updateKitchenTeamMember } = useKitchenTeamMemberUpdate()
  const { deleteKitchenTeamMember } = useKitchenTeamMemberDelete()
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
    const targetId = kitchenId.value
    const result = await createKitchenTeamMember({ kitchenId: targetId, ...input })
    if (targetId === kitchenId.value) team.selectCreated(result.memberId)
    return result
  }

  async function updateTeamMember(input: { memberId: string; name: string }) {
    const result = await updateKitchenTeamMember({
      kitchenId: kitchenId.value,
      memberId: input.memberId,
      changes: {
        name: input.name,
      },
    })
    return result
  }

  async function removeTeamMember(memberId: string) {
    const targetId = kitchenId.value
    const result = await deleteKitchenTeamMember(targetId, memberId)
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

  watchEffect(() => {
    pageState.publish({
      kitchen: state.value.kitchen,
      team: state.value.team,
      derived: derived.value,
    })
  })

  return {
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
