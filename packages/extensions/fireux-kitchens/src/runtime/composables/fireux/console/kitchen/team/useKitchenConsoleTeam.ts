import { computed, inject, provide, type InjectionKey } from 'vue'
import { useConsoleTeam } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTeam'
import { useKitchenChildCollection } from '../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  KitchenTeamJoinRequestStorage,
  KitchenTeamMemberStorage,
  type KitchenTeamJoinRequest,
  type KitchenTeamMember,
} from '../../../../../models/kitchen/team.model'
import { useKitchenConsole } from '../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../operations/Shared/useKitchenConsoleReadPage'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../core/useKitchenConsoleDemoData'

function createKitchenConsoleTeam() {
  const {
    selection,
    runtime,
  } = useKitchenConsole()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const demoData = useKitchenConsoleDemoData(runtime.isDemo)
  const demoTeamMembers = computed<KitchenTeamMember[]>(() =>
    findKitchenConsoleDemoScenario(
      demoData.data.value,
      kitchenId.value
    )?.team.map(member => ({ ...member })) ?? []
  )
  const access = useConsoleTeam({
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
  const page = useKitchenConsoleReadPage<KitchenTeamMember>({
    collectionName: KitchenTeamMemberStorage.collection,
    selectedKitchen,
    kitchenId,
    items: teamMembers,
    pending: teamPending,
    collectionPath,
  })
  const consoleTeamMembers = computed(() => page.collection.value.items)
  const joinRequests = computed<KitchenTeamJoinRequest[]>(() =>
    joinRequestItems.value
  )
  const pendingJoinRequests = computed(() =>
    joinRequests.value.filter((request) => request.status === 'pending')
  )
  const pending = computed(() => page.collection.value.pending)
  const joinRequestsPending = computed(() =>
    joinRequestItemsPending.value
  )
  const debug = computed(() => ({
    access: access.debug.value,
    people: {
      collectionPath: collectionPath.value,
      joinRequestsPath: joinRequestsPath.value,
      count: consoleTeamMembers.value.length,
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
    teamMembers: consoleTeamMembers,
    joinRequests,
    pendingJoinRequests,
    pending,
    joinRequestsPending,
    debug,
  }
}

export type KitchenConsoleTeamWorkspace = ReturnType<typeof createKitchenConsoleTeam>

const kitchenConsoleTeamKey: InjectionKey<KitchenConsoleTeamWorkspace> =
  Symbol('fireux-kitchen-console-team')

export function provideKitchenConsoleTeam() {
  const workspace = createKitchenConsoleTeam()
  provide(kitchenConsoleTeamKey, workspace)
  return workspace
}

export function useKitchenConsoleTeam() {
  return inject(kitchenConsoleTeamKey, null) ?? createKitchenConsoleTeam()
}
