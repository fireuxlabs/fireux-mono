import { computed, inject, provide, type InjectionKey } from 'vue'
import { useWorkspaceTeam } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTeam'
import { useKitchenChildCollection } from '../../firestore/utils/paths/useKitchenChildCollection'
import {
  KitchenTeamJoinRequestStorage,
  KitchenTeamMemberStorage,
  type KitchenTeamJoinRequest,
  type KitchenTeamMember,
} from '../../../utils/team.ts'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../operations/Shared/useKitchenWorkspaceReadPage'
import {
  findKitchenWorkspaceDemoScenario,
  useKitchenWorkspaceDemoData,
} from '../core/useKitchenWorkspaceDemoData'

function createKitchenWorkspaceTeam() {
  const { selection, runtime } = useKitchenWorkspace()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const demoData = useKitchenWorkspaceDemoData(runtime.isDemo)
  const demoTeamMembers = computed<KitchenTeamMember[]>(
    () =>
      findKitchenWorkspaceDemoScenario(
        demoData.data.value,
        kitchenId.value
      )?.team.map((member) => ({ ...member })) ?? []
  )
  const access = useWorkspaceTeam({
    target: selectedKitchen,
    targetId: kitchenId,
    readOnly,
    canWrite,
  })
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
  const teamMembers = computed(() =>
    runtime.isDemo.value ? demoTeamMembers.value : fetchedTeamMembers.value
  )
  const teamPending = computed(() =>
    runtime.isDemo.value ? demoData.pending.value : fetchedTeamPending.value
  )
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
  const joinRequests = computed<KitchenTeamJoinRequest[]>(
    () => joinRequestItems.value
  )
  const pendingJoinRequests = computed(() =>
    joinRequests.value.filter((request) => request.status === 'pending')
  )
  const pending = computed(() => page.collection.value.pending)
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
    joinRequests,
    pendingJoinRequests,
    pending,
    joinRequestsPending,
    debug,
  }
}

export type KitchenWorkspaceTeamWorkspace = ReturnType<
  typeof createKitchenWorkspaceTeam
>

const kitchenWorkspaceTeamKey: InjectionKey<KitchenWorkspaceTeamWorkspace> =
  Symbol('fireux-kitchen-workspace-team')

export function provideKitchenWorkspaceTeam() {
  const workspace = createKitchenWorkspaceTeam()
  provide(kitchenWorkspaceTeamKey, workspace)
  return workspace
}

export function useKitchenWorkspaceTeam() {
  return inject(kitchenWorkspaceTeamKey, null) ?? createKitchenWorkspaceTeam()
}
