import { computed } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useTeam } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import type { KitchenSurface } from '../../firestore/utils/view/useKitchenInterface'
import {
  KitchenTeamMemberDefaults,
  KitchenTeamMemberStorage,
  type KitchenTeamMember,
} from '../../../utils/team.ts'
import { kitchenTeamMemberLimit } from '../../../utils/team.ts'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'
import { useKitchenTeamMemberCollection } from './fetch/useKitchenTeamMemberCollection'
import { useAsyncData } from '#imports'

type KitchenTeamResponse = {
  ok: true
  members: Array<{
    memberId: string
    name: string
    avatar: string
    slug: string
    userId: string
    linked: boolean
    role: 'owner' | 'operator' | 'member'
  }>
}

export function useKitchenTeamData() {
  const appSession = useAppSession()
  const { currentUser, hasAuthState } = useAuth()
  const membership = appSession.appUser
  const fireux = useFireUXConfig()
  const workspace = useKitchenWorkspace()
  const selectedKitchen = computed<KitchenSurface | null>(() => {
    const kitchen = workspace.data.value
    if (!kitchen) return null
    return {
      id: kitchen.id,
      can_write: kitchen.can_write,
      name: kitchen.identity.display_name,
      display_name: kitchen.identity.display_name,
      tagline: kitchen.identity.tagline,
      image_url: kitchen.identity.image_url,
      identity: { ...kitchen.identity, gallery: [] },
      route_scope: 'live',
    }
  })
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const readOnly = computed(() => false)
  const canWrite = computed(() => selectedKitchen.value?.can_write === true)

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
        if (!user || !kitchenId) return { ok: true, members: [] }
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
  const projectedMembersById = computed(
    () =>
      new Map(
        (teamResponse.value?.members || []).map((member) => [
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
          name: member.name,
          display_name: member.name,
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
  const page = useKitchenWorkspaceReadPage<KitchenTeamMember>({
    collectionName: KitchenTeamMemberStorage.collection,
    selectedKitchen,
    kitchenId,
    items: teamMembers,
    pending: liveTeam.pending,
    collectionPath,
  })
  const workspaceTeamMembers = computed(() => page.collection.value.items)
  const selectableTeamMembers = computed(() =>
    workspaceTeamMembers.value.filter(
      (member) => member.active !== false && member.status !== 'inactive'
    )
  )
  const subscription = computed(() => membership.value?.subscription || 'free')
  const teamMemberLimit = computed(() =>
    kitchenTeamMemberLimit(fireux.subscriptionCapacity, subscription.value)
  )
  const team = useTeam({
    canWrite,
    members: selectableTeamMembers,
    memberLimit: teamMemberLimit,
  })
  const pending = computed(
    () =>
      appSession.pending.value ||
      workspace.outcome.value === 'pending' ||
      liveTeam.pending.value
  )
  const error = computed(
    () =>
      teamError.value ??
      appSession.error.value ??
      (workspace.outcome.value === 'error'
        ? new Error('Kitchen workspace could not be read.')
        : undefined) ??
      undefined
  )
  const debug = computed(() => ({
    people: {
      collectionPath: collectionPath.value,
      count: workspaceTeamMembers.value.length,
      pending: pending.value,
    },
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    teamMembers: workspaceTeamMembers,
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
