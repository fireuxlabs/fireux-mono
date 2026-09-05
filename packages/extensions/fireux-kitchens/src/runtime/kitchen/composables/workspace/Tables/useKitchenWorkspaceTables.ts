import { computed } from 'vue'
import { useKitchenChildCollection } from '../../firestore/utils/paths/useKitchenChildCollection'
import {
  KitchenTableTabStorage,
  type KitchenTableTab,
} from '../../../utils/table-tab.ts'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'
import { readKitchenTableCount } from '../../../utils/kitchen-readers'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

const terminalStatuses = new Set(['closed', 'cancelled'])

export function useKitchenWorkspaceTables() {
  const workspace = useKitchenWorkspace()
  const selectedKitchen = workspace.data
  const kitchenId = workspace.id
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
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
    readOnly: computed(() => false),
    canWrite: computed(() => Boolean(workspace.data.value)),
    debug,
  }
}
