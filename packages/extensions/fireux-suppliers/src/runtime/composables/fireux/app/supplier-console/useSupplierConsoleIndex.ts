import { computed, type Ref } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { SupplierCollectionFilter } from '../../firestore/supplier/fetch/useSupplierCollection'
import { useSupplierFetch } from '../../firestore/supplier/fetch/useSupplierFetch'
import { useSupplierCreate } from '../../firestore/supplier/mutations/useSupplierCreate'
import { type SupplierSurface } from '../../firestore/supplier/utils/view/useSupplierInterface'
import { useSupplierConsole } from './useSupplierConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

type UseSupplierConsoleIndexOptions = {
  filter?: SupplierCollectionFilter | Ref<SupplierCollectionFilter | null | undefined> | null
}

export function useSupplierConsoleIndex(
  options: UseSupplierConsoleIndexOptions = {}
) {
  const { uid } = useAuth()
  const { supplier: testSupplierSource, pending: testSupplierPending } =
    useSupplierFetch(uid, { source: 'test' })
  const { createTestSupplier } = useSupplierCreate()
  const {
    liveSuppliers,
    demoSuppliers,
    selectedSupplier,
    selectedMode,
    supplierId,
    rootCollection,
    canWrite,
    selectSupplier,
    clearSelectedSupplier,
  } = useSupplierConsole({
    filter: options.filter,
  })

  const sourceSuppliers = computed(() => ({
    live: liveSuppliers.value,
    demo: demoSuppliers.value,
    test: testSupplierSource.value,
  }))

  const consoleIndex = useConsoleIndex<SupplierSurface, SupplierSurface, SupplierSurface>({
    entities: sourceSuppliers,
    selectEntity: selectSupplier,
    getTestId: (supplier) => normalizeString(supplier.id),
    autoCreateTest: true,
    testPending: testSupplierPending,
    testCreateKey: uid,
    createTestEntity: async ({ avatarSrc, displayName }) => {
      const testId = normalizeString(uid.value)
      if (!testId) return null

      const userLabel = normalizeString(displayName) || `User ${testId.slice(0, 6)}`
      const result = await createTestSupplier({
        id: testId,
        name: 'Test Supplier',
        subtitle: userLabel,
        image_url: normalizeString(avatarSrc),
      })

      return normalizeString(result.id)
    },
  })

  return {
    state: consoleIndex.state,
    user: consoleIndex.user,
    suppliers: consoleIndex.entities,
    actions: consoleIndex.actions,
    selectedSupplier,
    selectedMode,
    supplierId,
    rootCollection,
    canWrite,
    clearSelectedSupplier,
  }
}
