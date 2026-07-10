import { computed } from 'vue'
import { useKitchenChildCollection } from '../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  KitchenTableTabStorage,
  type KitchenTableTab,
} from '../../../../../../models/kitchen/table-tab.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'
import { readKitchenTableCount } from '../../../../../../utils/kitchen-spine'

const terminalStatuses = new Set(['closed', 'cancelled'])

export function useKitchenConsoleTables() {
  const { selection, runtime } = useKitchenConsole()
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
  const page = useKitchenConsoleReadPage<KitchenTableTab>({
    collectionName: KitchenTableTabStorage.collection,
    selectedKitchen,
    kitchenId,
    items: tableTabs,
    pending: tableTabsPending,
    collectionPath,
  })
  const activeTabs = computed(() =>
    page.collection.value.items.filter((tab) =>
      !terminalStatuses.has(String(tab.status || '').trim())
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
  const tableCount = computed(() => readKitchenTableCount(selectedKitchen.value))
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
