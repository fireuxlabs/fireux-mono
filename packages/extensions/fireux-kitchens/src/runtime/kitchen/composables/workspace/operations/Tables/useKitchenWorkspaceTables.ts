import { computed } from 'vue'
import { useKitchenChildCollection } from '../../../firestore/utils/paths/useKitchenChildCollection'
import {
  KitchenTableTabStorage,
  type KitchenTableTab,
} from '../../../../models/table-tab.model.ts'
import { useKitchenWorkspace } from '../../core/useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../Shared/useKitchenWorkspaceReadPage'
import { readKitchenTableCount } from '../../../../utils/kitchen-readers'

const terminalStatuses = new Set(['closed', 'cancelled'])

export function useKitchenWorkspaceTables() {
  const { selection, runtime } = useKitchenWorkspace()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const {
    items: tableTabs,
    pending: tableTabsPending,
    collectionPath,
  } = useKitchenChildCollection<KitchenTableTab>(
    KitchenTableTabStorage.collection,
    fetchKitchenId,
    {
      kitchenCollectionPath: rootCollection,
      databaseId,
    }
  )
  const page = useKitchenWorkspaceReadPage<KitchenTableTab>({
    collectionName: KitchenTableTabStorage.collection,
    selectedKitchen,
    kitchenId,
    items: tableTabs,
    pending: tableTabsPending,
    collectionPath,
  })
  const activeTabs = computed(() =>
    page.collection.value.items.filter(
      (tab) => !terminalStatuses.has(String(tab.status || '').trim())
    )
  )
  const stagingTabs = computed(() =>
    activeTabs.value.filter((tab) => tab.current_round_status === 'staging')
  )
  const billingTabs = computed(() =>
    activeTabs.value.filter((tab) =>
      ['bill_requested', 'payment_pending'].includes(tab.status)
    )
  )
  const tableCount = computed(() =>
    readKitchenTableCount(selectedKitchen.value)
  )
  const debug = computed(() => ({
    ...page.debug.value,
    activeCount: activeTabs.value.length,
    stagingCount: stagingTabs.value.length,
    billingCount: billingTabs.value.length,
    configuredTableCount: tableCount.value,
  }))

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    rootCollection,
    databaseId,
    collectionPath,
    tableTabs,
    activeTabs,
    stagingTabs,
    billingTabs,
    tableCount,
    pending: tableTabsPending,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    debug,
  }
}
