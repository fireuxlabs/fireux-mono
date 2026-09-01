import {
  computed,
  inject,
  nextTick,
  provide,
  watch,
  type InjectionKey,
} from 'vue'
import { useCurrentAppContext } from 'fireux-core/runtime/app/composables/useCurrentAppContext'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspaceTeam } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTeam'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenChildCollection } from '../../firestore/utils/paths/useKitchenChildCollection'
import type { KitchenSurface } from '../../firestore/utils/view/useKitchenInterface'
import {
  KitchenTeamJoinRequestStorage,
  KitchenTeamMemberStorage,
  type KitchenTeamJoinRequest,
  type KitchenTeamMember,
} from '../../../utils/team.ts'
import { kitchenTeamMemberLimit } from '../../../utils/team.ts'
import { useKitchenWorkspaceCurrent } from '../index/useKitchenWorkspaceCurrent'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'

function createKitchenWorkspaceTeam() {
  const appContext = useCurrentAppContext()
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
  const {
    items: fetchedTeamMembers,
    pending: fetchedTeamPending,
    collectionPath,
  } = useKitchenChildCollection<KitchenTeamMember>(
    KitchenTeamMemberStorage.collection,
    fetchKitchenId,
    {
      kitchenCollectionPath: rootCollection,
      databaseId,
    }
  )
  const teamMembers = fetchedTeamMembers
  const teamPending = fetchedTeamPending
  const {
    items: joinRequestItems,
    pending: joinRequestItemsPending,
    collectionPath: joinRequestsPath,
  } = useKitchenChildCollection<KitchenTeamJoinRequest>(
    KitchenTeamJoinRequestStorage.collection,
    fetchKitchenId,
    {
      kitchenCollectionPath: rootCollection,
      databaseId,
    }
  )
  const page = useKitchenWorkspaceReadPage<KitchenTeamMember>({
    collectionName: KitchenTeamMemberStorage.collection,
    selectedKitchen,
    kitchenId,
    items: teamMembers,
    pending: teamPending,
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
  const joinRequests = computed<KitchenTeamJoinRequest[]>(
    () => joinRequestItems.value
  )
  const pendingJoinRequests = computed(() =>
    joinRequests.value.filter((request) => request.status === 'pending')
  )
  const pending = computed(
    () =>
      appContext.pending.value ||
      current.pending.value ||
      page.collection.value.pending
  )
  const error = computed(
    () => appContext.error.value ?? current.error.value ?? undefined
  )
  const joinRequestsPending = computed(() => joinRequestItemsPending.value)
  const debug = computed(() => ({
    access: access.debug.value,
    people: {
      collectionPath: collectionPath.value,
      joinRequestsPath: joinRequestsPath.value,
      count: workspaceTeamMembers.value.length,
      joinRequestsCount: joinRequests.value.length,
      pendingJoinRequestsCount: pendingJoinRequests.value.length,
      pending: pending.value,
      joinRequestsPending: joinRequestsPending.value,
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
    selectableTeamMembers,
    selectedTeamMember: access.selectedTeamMember,
    selectedTeamMemberId: access.selectedTeamMemberId,
    subscription,
    teamMemberLimit: access.memberLimit,
    canCreateTeamMember: access.canCreateTeamMember,
    teamMemberCapacityReached: access.teamMemberCapacityReached,
    joinRequests,
    pendingJoinRequests,
    pending,
    error,
    joinRequestsPending,
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
