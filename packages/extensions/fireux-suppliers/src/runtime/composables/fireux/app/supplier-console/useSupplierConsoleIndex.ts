import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useSupplierFetch } from '../../firestore/supplier/fetch/useSupplierFetch'
import { type SupplierSurface } from '../../firestore/supplier/utils/view/useSupplierInterface'
import { useSupplierConsole } from './useSupplierConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleIndex() {
  const { uid } = useAuth()
  const { supplier: testSupplierSource, pending: testSupplierPending } = useSupplierFetch(uid, {
    collectionPath: 'test-suppliers',
  })
  const {
    liveSuppliers,
    demoSuppliers,
    selectedSupplier,
    selectSupplier,
    clearSelectedSupplier,
  } = useSupplierConsole()

  const sourceSuppliers = computed(() => ({
    live: liveSuppliers.value,
    demo: demoSuppliers.value,
    test: testSupplierSource.value,
  }))

  const consoleIndex = useConsoleIndex<SupplierSurface, SupplierSurface, SupplierSurface>({
    entities: sourceSuppliers,
    selectEntity: selectSupplier,
    getTestId: (supplier) => normalizeString(supplier.id),
    testPending: testSupplierPending,
  })

  return {
    state: consoleIndex.state,
    user: consoleIndex.user,
    suppliers: consoleIndex.entities,
    actions: consoleIndex.actions,
    selectedSupplier,
    clearSelectedSupplier,
  }
}
