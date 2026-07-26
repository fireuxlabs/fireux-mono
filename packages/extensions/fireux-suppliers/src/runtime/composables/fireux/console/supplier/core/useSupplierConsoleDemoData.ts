// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: lazily adapt owner-local Supplier fixtures for console use.
import type { MaybeRefOrGetter } from 'vue'
import {
  useConsoleDemoData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleDemoData'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../../../firestore/supplier/utils/view/useSupplierInterface'
import type {
  SupplierCatalogue,
  SupplierIngredient,
  SupplierItem,
} from '../../../../../models/supplier/Supplier.model'

export type SupplierConsoleDemoScenario = {
  appId: string
  supplier: SupplierSurface
  ingredients: SupplierIngredient[]
  items: SupplierItem[]
  catalogues: SupplierCatalogue[]
}

export type SupplierConsoleDemoData = {
  suppliers: SupplierSurface[]
  scenarios: SupplierConsoleDemoScenario[]
}

export function useSupplierConsoleDemoData(
  active: MaybeRefOrGetter<boolean>
) {
  const { surface } = useSupplierInterface()

  return useConsoleDemoData<SupplierConsoleDemoData>({
    active,
    loader: async () => {
      const { supplierDemoScenarios } = await import(
        '../../../../../demo/supplier/scenarios'
      )
      const scenarios = supplierDemoScenarios.reduce<SupplierConsoleDemoScenario[]>(
        (items, scenario) => {
          const supplier = surface({ supplier: scenario.supplier })
          if (!supplier) return items

          items.push({
            appId: scenario.appId,
            supplier,
            ingredients: scenario.ingredients.map(ingredient => ({
              ...ingredient,
            })),
            items: scenario.items.map(item => ({ ...item })),
            catalogues: scenario.catalogues.map(catalogue => ({
              ...catalogue,
              sections: catalogue.sections.map(section => ({
                ...section,
                items: section.items.map(item => ({ ...item })),
              })),
            })),
          })
          return items
        },
        []
      )

      return {
        suppliers: scenarios.map(scenario => scenario.supplier),
        scenarios,
      }
    },
    isEmpty: (value) => value.suppliers.length === 0,
  })
}

export function findSupplierConsoleDemoScenario(
  data: SupplierConsoleDemoData | undefined,
  supplierId: string
) {
  const id = String(supplierId ?? '').trim()
  if (!id) return null

  return data?.scenarios.find(scenario => scenario.supplier.id === id) ?? null
}
