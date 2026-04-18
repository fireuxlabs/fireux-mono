import { computed } from 'vue'
import { useState } from '#imports'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useSupplierCollection } from '../../firestore/supplier/fetch/useSupplierCollection'
import { useSupplierFetch } from '../../firestore/supplier/fetch/useSupplierFetch'

type SupplierConsoleMode = ConsoleMode

type SupplierConsoleState = {
  selectedId: string
  selectedMode: SupplierConsoleMode
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsole() {
  const { suppliers: liveSuppliers } = useSupplierCollection()
  const { uid } = useAuth()
  const { supplier: testSupplier } = useSupplierFetch(uid, {
    collectionPath: 'test-suppliers',
  })
  const state = useState<SupplierConsoleState>('console:suppliers', () => ({
    selectedId: '',
    selectedMode: 'live',
  }))
  const selectedId = computed(() => normalizeString(state.value.selectedId))
  const selectedMode = computed(() => state.value.selectedMode)

  const selectedSupplier = computed(() => {
    if (!selectedId.value) return null

    if (selectedMode.value === 'test') {
      const supplier = testSupplier.value
      return normalizeString(supplier?.id) === selectedId.value ? supplier : null
    }

    return (
      liveSuppliers.value.find((supplier) => normalizeString(supplier?.id) === selectedId.value) ??
      null
    )
  })

  const header = computed<ConsoleHeaderData>(() => {
    const supplier = selectedSupplier.value as Record<string, unknown> | null
    if (!supplier) return null

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
    state.value = {
      selectedId: '',
      selectedMode: 'live',
    }
  }

  const selectSupplier = (supplierId: string, mode: SupplierConsoleMode = 'live') => {
    state.value = {
      selectedId: normalizeString(supplierId),
      selectedMode: mode,
    }
  }

  return {
    selectedSupplier,
    selectedMode,
    clearSelectedSupplier,
    selectSupplier,
  }
}
