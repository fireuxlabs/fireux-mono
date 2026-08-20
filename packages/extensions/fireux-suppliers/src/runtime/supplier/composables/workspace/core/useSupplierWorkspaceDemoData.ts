// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: lazily adapt owner-local Supplier fixtures for workspace use.
import type { MaybeRefOrGetter } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspaceDemoData } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceDemoData'
import { type SupplierSurface } from '../../firestore/utils/view/useSupplierInterface'
import { projectSupplierDemoWorld } from '../../../utils/supplier-demo-world'
import type { PublicCompanyProjection } from 'fireux-companies/runtime/place/models/company-public.model'
import type {
  SupplierCatalogue,
  SupplierIngredient,
  SupplierItem,
} from '../../../models/Supplier.model.ts'

export type SupplierWorkspaceDemoScenario = {
  appId: string
  supplier: SupplierSurface
  companyPlace: PublicCompanyProjection
  ingredients: SupplierIngredient[]
  items: SupplierItem[]
  catalogues: SupplierCatalogue[]
}

export type SupplierWorkspaceDemoData = {
  suppliers: SupplierSurface[]
  scenarios: SupplierWorkspaceDemoScenario[]
}

export function useSupplierWorkspaceDemoData(active: MaybeRefOrGetter<boolean>) {
  const { appId } = useFireUXConfig()

  return useWorkspaceDemoData<SupplierWorkspaceDemoData>({
    active,
    loader: async () => {
      const [supplierModule, companyModule] = await Promise.all([
        import('../../../demo/scenarios'),
        import('fireux-companies/runtime/place/demo/company/scenarios'),
      ])
      const supplierDemoWorld = projectSupplierDemoWorld({
        scenarios: supplierModule.supplierDemoScenarios,
        companyTargets: companyModule.companyDemoTargets,
      })
      const scenarios = supplierDemoWorld.reduce<SupplierWorkspaceDemoScenario[]>(
        (items, scenario) => {
          if (scenario.appId !== String(appId || '').trim()) return items

          items.push({
            appId: scenario.appId,
            supplier: scenario.supplier,
            companyPlace: scenario.companyPlace,
            ingredients: scenario.ingredients.map((ingredient) => ({
              ...ingredient,
            })),
            items: scenario.items.map((item) => ({ ...item })),
            catalogues: scenario.catalogues.map((catalogue) => ({
              ...catalogue,
              sections: catalogue.sections.map((section) => ({
                ...section,
                items: section.items.map((item) => ({ ...item })),
              })),
            })),
          })
          return items
        },
        []
      )

      return {
        suppliers: scenarios.map((scenario) => scenario.supplier),
        scenarios,
      }
    },
    isEmpty: (value) => value.suppliers.length === 0,
  })
}

export function findSupplierWorkspaceDemoScenario(
  data: SupplierWorkspaceDemoData | undefined,
  supplierId: string
) {
  const id = String(supplierId ?? '').trim()
  if (!id) return null

  return data?.scenarios.find((scenario) => scenario.supplier.id === id) ?? null
}
