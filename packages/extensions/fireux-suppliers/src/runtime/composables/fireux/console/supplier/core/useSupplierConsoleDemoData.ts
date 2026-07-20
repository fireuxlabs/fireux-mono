// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: lazily adapt owner-local Supplier fixtures for console use.
import type { MaybeRefOrGetter } from 'vue'
import {
  useConsoleDemoData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleDemoData'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../../../firestore/supplier/utils/view/useSupplierInterface'

export type SupplierConsoleDemoData = {
  suppliers: SupplierSurface[]
}

export function useSupplierConsoleDemoData(
  active: MaybeRefOrGetter<boolean>
) {
  const { surface } = useSupplierInterface()

  return useConsoleDemoData<SupplierConsoleDemoData>({
    active,
    loader: async () => {
      const { supplierDemoRecords } = await import(
        '../../../../../demo/supplier/scenarios'
      )
      const suppliers = supplierDemoRecords.reduce<SupplierSurface[]>(
        (items, supplier) => {
          const item = surface({ supplier })
          if (item) items.push(item)
          return items
        },
        []
      )

      return { suppliers }
    },
    isEmpty: (value) => value.suppliers.length === 0,
  })
}
