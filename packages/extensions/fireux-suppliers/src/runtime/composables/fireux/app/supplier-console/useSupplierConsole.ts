import { computed } from 'vue'
import {
  useConsole,
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useSupplierCollection } from '../../firestore/supplier/fetch/useSupplierCollection'
import { useSupplierFetch } from '../../firestore/supplier/fetch/useSupplierFetch'

type SupplierConsoleMode = 'live' | 'demo' | 'test'

type DemoSupplierListItem = {
  id: string
  name: string
  label?: string
  image_url?: string
  mode: 'demo'
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsole() {
  const { suppliers: liveSuppliers } = useSupplierCollection()
  const { uid } = useAuth()
  const testSupplierId = computed(() => normalizeString(uid.value))
  const demoSuppliers = computed<DemoSupplierListItem[]>(() => [])
  const { supplier: testSupplier } = useSupplierFetch(testSupplierId, {
    collectionPath: 'test-suppliers',
  })
  const { selectedId, selectedMode, selectEntity, clearSelection } = useConsole('suppliers')

  const suppliers = computed(() => ({
    live: liveSuppliers.value,
    demo: demoSuppliers.value,
    test: testSupplier.value,
  }))

  const selectedSupplier = computed(() => {
    const supplierId = normalizeString(selectedId.value)
    if (!supplierId) return null

    if (selectedMode.value === 'demo') {
      return demoSuppliers.value.find((supplier) => supplier.id === supplierId) ?? null
    }

    if (selectedMode.value === 'test') {
      const supplier = testSupplier.value
      return normalizeString(supplier?.id) === supplierId ? supplier : null
    }

    return (
      liveSuppliers.value.find((supplier) => normalizeString(supplier?.id) === supplierId) ?? null
    )
  })

  const header = computed<ConsoleHeaderData>(() => {
    const supplier = selectedSupplier.value as Record<string, unknown> | null
    if (!supplier) return null

    if (selectedMode.value === 'demo') {
      return {
        title: normalizeString(supplier.name) || normalizeString(supplier.id),
        subtitle: normalizeString(supplier.label) || normalizeString(supplier.id) || undefined,
        imageUrl: normalizeString(supplier.image_url) || undefined,
      }
    }

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Supplier',
        subtitle:
          normalizeString(supplier.supplier_organization_name) ||
          normalizeString(supplier.name) ||
          normalizeString(supplier.id) ||
          undefined,
        imageUrl:
          normalizeString(supplier.supplier_image) ||
          normalizeString(supplier.image_url) ||
          undefined,
      }
    }

    return {
      title:
        normalizeString(supplier.supplier_organization_name) ||
        normalizeString(supplier.name) ||
        normalizeString(supplier.short_name) ||
        normalizeString(supplier.id),
      subtitle:
        normalizeString(supplier.supplier_headline) ||
        normalizeString(supplier.summary) ||
        normalizeString(supplier.id) ||
        undefined,
      imageUrl:
        normalizeString(supplier.supplier_image) ||
        normalizeString(supplier.image_url) ||
        undefined,
    }
  })

  usePublishConsoleHeader('suppliers', header)

  const clearSelectedSupplier = () => {
    clearSelection()
  }
  const selectSupplier = (supplierId: string, mode: SupplierConsoleMode = 'live') => {
    selectEntity(supplierId, mode)
  }

  return {
    suppliers,
    selectedSupplier,
    selectedMode,
    clearSelectedSupplier,
    selectSupplier,
  }
}
