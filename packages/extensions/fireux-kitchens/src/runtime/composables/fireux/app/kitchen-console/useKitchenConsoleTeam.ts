import { computed } from 'vue'
import { useKitchenConsoleCollection } from '../../firestore/runtime-kitchen/fetch/useKitchenConsoleCollection'
import type { KitchenTeamMember } from '../../../../models/kitchen-team.model'
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
  } = useKitchenConsoleCollection<KitchenTeamMember>('team', fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
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
  const pending = computed(() => page.collection.value.pending)
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: teamMembers.value.length,
    pending: pending.value,
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
    pending,
    debug,
  }
}
