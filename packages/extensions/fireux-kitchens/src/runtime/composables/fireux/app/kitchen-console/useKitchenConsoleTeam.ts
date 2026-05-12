import { computed } from 'vue'
import { useKitchenChildCollection } from '../../firestore/kitchen/fetch/useKitchenChildCollection'
import type {
  KitchenTeamJoinRequest,
  KitchenTeamMember,
} from '../../../../models/kitchen-team.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

export function useKitchenConsoleTeam() {
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    databaseId,
    canWrite,
  } = useKitchenConsole()
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const {
    items: liveTeamMembers,
    pending: livePending,
    collectionPath,
  } = useKitchenChildCollection<KitchenTeamMember>('team', fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const {
    items: liveJoinRequests,
    pending: liveJoinRequestsPending,
    collectionPath: joinRequestsPath,
  } = useKitchenChildCollection<KitchenTeamJoinRequest>(
    'joinRequests',
    fetchKitchenId,
    {
      kitchenCollectionPath: rootCollection,
      databaseId,
    }
  )
  const page = useKitchenConsoleReadPage<KitchenTeamMember>({
    collectionName: 'team',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveTeamMembers,
    livePending,
    collectionPath,
  })
  const teamMembers = computed(() => page.collection.value.items)
  const joinRequests = computed<KitchenTeamJoinRequest[]>(() =>
    selectedMode.value === 'demo' ? [] : liveJoinRequests.value
  )
  const pendingJoinRequests = computed(() =>
    joinRequests.value.filter((request) => request.status === 'pending')
  )
  const pending = computed(() => page.collection.value.pending)
  const joinRequestsPending = computed(() =>
    selectedMode.value === 'demo' ? false : liveJoinRequestsPending.value
  )
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    joinRequestsPath: joinRequestsPath.value,
    count: teamMembers.value.length,
    joinRequestsCount: joinRequests.value.length,
    pendingJoinRequestsCount: pendingJoinRequests.value.length,
    pending: pending.value,
    joinRequestsPending: joinRequestsPending.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    canWrite,
    teamMembers,
    joinRequests,
    pendingJoinRequests,
    pending,
    joinRequestsPending,
    debug,
  }
}
