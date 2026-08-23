import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { SupplierStorage } from '../../../models/Supplier.model.ts'
import { useSupplierCollection } from '../../firestore/fetch/useSupplierCollection'
import type { SupplierSurface } from '../../firestore/utils/view/useSupplierInterface'
import { useSupplierWorkspaceAccess } from './useSupplierWorkspaceAccess'

function createSupplierWorkspace() {
  const workspace = useWorkspace('supplier')
  const fireux = useFireUXConfig()
  const { uid } = useAuth()
  const access = useSupplierWorkspaceAccess()
  const collection = useSupplierCollection({
    filter: computed(() => ({ ids: access.ids.value })),
  })
  const supplier = computed<SupplierSurface | null>(
    () =>
      collection.suppliers.value.find(
        (item) => normalizeString(item.id) === workspace.currentId.value
      ) ?? null
  )
  const canWrite = computed(() => targetHasOperator(supplier.value, uid.value))

  return {
    suppliers: {
      targets: collection.suppliers,
      count: collection.count,
      pending: collection.pending,
      error: collection.error,
      outcome: computed(() =>
        access.outcome.value === 'ready'
          ? collection.outcome.value
          : access.outcome.value
      ),
    },
    selection: {
      supplier,
      supplierId: workspace.currentId,
      hasSelection: computed(() => Boolean(supplier.value)),
    },
    runtime: {
      appId: computed(() => fireux.appId),
      ecosystem: computed(() => fireux.ecosystem),
      rootCollection: computed(() => SupplierStorage.collection),
      dataType: computed(() => 'live' as const),
      isDemo: computed(() => false),
      readOnly: computed(() => !canWrite.value),
      canWrite,
    },
    actions: {
      selectSupplier: workspace.setCurrent,
      clearSelectedSupplier: workspace.clearCurrent,
    },
  }
}

export function useSupplierWorkspace() {
  return createSupplierWorkspace()
}
