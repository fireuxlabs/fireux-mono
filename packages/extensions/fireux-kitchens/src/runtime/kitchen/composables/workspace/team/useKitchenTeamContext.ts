import {
  computed,
  inject,
  nextTick,
  provide,
  watch,
  type InjectionKey,
} from 'vue'
import { useCurrentAppContext } from 'fireux-core/runtime/app/composables/useCurrentAppContext'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspaceTeam } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTeam'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import type { KitchenSurface } from '../../firestore/utils/view/useKitchenInterface'
import {
  KitchenTeamMemberDefaults,
  KitchenTeamMemberStorage,
  type KitchenTeamMember,
} from '../../../utils/team.ts'
import { kitchenTeamMemberLimit } from '../../../utils/team.ts'
import { useKitchenWorkspaceCurrent } from '../index/useKitchenWorkspaceCurrent'
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

function createKitchenWorkspaceTeam() {
  const appContext = useCurrentAppContext()
  const { currentUser, hasAuthState } = useAuth()
  const membership = appContext.membership
  const fireux = useFireUXConfig()
  const workspace = useWorkspace('kitchen')
  const primaryKitchenId = computed(
    () => membership.value?.primary_kitchen || ''
  )
  const current = useKitchenWorkspaceCurrent(primaryKitchenId)
  const selectedKitchen = computed<KitchenSurface | null>(() => {
    const kitchen = current.kitchen.value
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

  watch(
    [primaryKitchenId, selectedKitchen],
    ([primaryId, kitchen]: [string, KitchenSurface | null]) => {
      if (!primaryId || kitchen?.id !== primaryId) {
        if (!primaryId) workspace.clearActive()
        return
      }
      workspace.activate(
        normalizeString(kitchen.id),
        normalizeString(kitchen.identity?.display_name),
        normalizeString(kitchen.identity?.tagline),
        normalizeString(kitchen.identity?.image_url)
      )
    },
    { immediate: true }
  )

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
  const {
    data: teamResponse,
    error: teamError,
    refresh: refreshTeam,
  } = useAsyncData<KitchenTeamResponse>(
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
  const access = useWorkspaceTeam({
    target: selectedKitchen,
    targetId: kitchenId,
    readOnly,
    canWrite,
    members: selectableTeamMembers,
    memberLimit: teamMemberLimit,
  })
  const pending = computed(
    () =>
      appContext.pending.value ||
      current.pending.value ||
      liveTeam.pending.value
  )
  const error = computed(
    () =>
      teamError.value ??
      appContext.error.value ??
      current.error.value ??
      undefined
  )
  const debug = computed(() => ({
    access: access.debug.value,
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

  async function refresh() {
    await appContext.refresh()
    await nextTick()
    await current.refresh()
    await refreshTeam()
  }

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    teamIds: access.teamIds,
    operatorIds: access.operatorIds,
    accessIds: access.accessIds,
    collectionPath,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    teamMembers: workspaceTeamMembers,
    memberAvatarById,
    selectableTeamMembers,
    selectedTeamMember: access.selectedTeamMember,
    selectedTeamMemberId: access.selectedTeamMemberId,
    subscription,
    teamMemberLimit: access.memberLimit,
    canCreateTeamMember: access.canCreateTeamMember,
    teamMemberCapacityReached: access.teamMemberCapacityReached,
    pending,
    error,
    refresh,
    debug,
  }
}

export type KitchenWorkspaceTeamWorkspace = ReturnType<
  typeof createKitchenWorkspaceTeam
>

const kitchenWorkspaceTeamKey: InjectionKey<KitchenWorkspaceTeamWorkspace> =
  Symbol('fireux-kitchen-workspace-team')

export function provideKitchenTeamContext() {
  const workspace = createKitchenWorkspaceTeam()
  provide(kitchenWorkspaceTeamKey, workspace)
  return workspace
}

export function useKitchenTeamContext() {
  return inject(kitchenWorkspaceTeamKey, null) ?? createKitchenWorkspaceTeam()
}
