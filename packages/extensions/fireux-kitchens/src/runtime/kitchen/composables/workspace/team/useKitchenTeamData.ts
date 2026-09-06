import { computed } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useTeam } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  KitchenTeamMemberDefaults,
  KitchenTeamMemberStorage,
  type KitchenTeamMember,
} from '../../../utils/team.ts'
import { kitchenTeamMemberLimit } from '../../../utils/team.ts'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useKitchenTeamMemberCollection } from './fetch/useKitchenTeamMemberCollection'
import { useAsyncData } from '#imports'

type KitchenTeamResponse = {
  ok: true
  kitchenId: string
  canManageTeam: boolean
  members: Array<{
    memberId: string
    name: string
    avatar: string
    slug: string
    userId: string
    linked: boolean
    role: 'owner' | 'developer' | 'operator' | 'member'
  }>
}

export function useKitchenTeamData() {
  const appSession = useAppSession()
  const { currentUser, hasAuthState } = useAuth()
  const membership = appSession.appUser
  const fireux = useFireUXConfig()
  const workspace = useKitchenWorkspace()
  const selectedKitchen = workspace.data
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const readOnly = computed(() => false)

  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const collectionPath = computed(() => `kitchens/${fetchKitchenId.value}/team`)
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
          display_name: projected?.name || member.name,
          avatar: projected?.avatar || '',
          slug: member.slug,
          role: member.role,
          status: member.status,
          active: member.active,
        }
      })
  )
  const memberAvatarById = computed(
    () => new Map(teamMembers.value.map((member) => [member.id, member.avatar]))
  )
  const selectableTeamMembers = computed(() =>
    teamMembers.value.filter(
      (member) => member.active !== false && member.status !== 'inactive'
    )
  )
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
    settled: computed(() => !pending.value && !error.value),
    memberLimit: teamMemberLimit,
  })
  const debug = computed(() => ({
    people: {
      collectionPath: collectionPath.value,
      count: teamMembers.value.length,
      pending: pending.value,
    },
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    teamMembers,
    memberAvatarById,
    selectableTeamMembers,
    selectedTeamMember: team.selectedTeamMember,
    selectedTeamMemberId: team.selectedTeamMemberId,
    subscription,
    teamMemberLimit: team.memberLimit,
    canCreateTeamMember: team.canCreateTeamMember,
    teamMemberCapacityReached: team.teamMemberCapacityReached,
    pending,
    error,
    debug,
  }
}

export type KitchenTeamData = ReturnType<typeof useKitchenTeamData>
