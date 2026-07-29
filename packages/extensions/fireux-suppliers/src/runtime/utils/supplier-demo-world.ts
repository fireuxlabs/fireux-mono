import type {
  PublicCompanyProjection,
} from 'fireux-companies/runtime/models/company-public.model'
import type {
  AppSupplier,
  Supplier,
} from '../models/supplier/Supplier.model'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

type SupplierCompanyDemoTargetLike = {
  company: {
    id?: string | null
  }
  place: {
    id?: string | null
  }
  publicCompany: PublicCompanyProjection
}

type SupplierDemoScenarioLike = {
  supplier: Supplier
  appSupport: AppSupplier
}

export type ProjectedSupplierDemoScenario<
  TScenario extends SupplierDemoScenarioLike,
> = Omit<TScenario, 'supplier'> & {
  supplier: SupplierSurface
  companyPlace: PublicCompanyProjection
}

const clean = (value: unknown) => String(value ?? '').trim()

export function projectSupplierDemoWorld<
  TScenario extends SupplierDemoScenarioLike,
>(input: {
  scenarios: readonly TScenario[]
  companyTargets: readonly SupplierCompanyDemoTargetLike[]
}): ProjectedSupplierDemoScenario<TScenario>[] {
  const companyTargetById = new Map<string, SupplierCompanyDemoTargetLike>()
  for (const target of input.companyTargets) {
    const companyId = clean(target.company.id)
    if (
      !companyId
      || companyTargetById.has(companyId)
      || clean(target.place.id) !== companyId
      || clean(target.publicCompany.id) !== companyId
    ) {
      throw new Error(
        `Supplier Demo Company/Place target is invalid: ${companyId || '(missing-id)'}`
      )
    }
    companyTargetById.set(companyId, target)
  }

  const { surface } = useSupplierInterface()
  const supplierIds = new Set<string>()
  return input.scenarios.map((scenario) => {
    const supplierId = clean(scenario.supplier.id)
    const companyId = clean(scenario.supplier.company_id)
    const companyTarget = companyTargetById.get(companyId)
    if (
      !supplierId
      || supplierIds.has(supplierId)
      || !companyTarget
      || 'place_id' in scenario.supplier
    ) {
      throw new Error(
        `Supplier Demo Company/Place relationship is unresolved: ${
          supplierId || '(missing-id)'
        }`
      )
    }

    const supplier = surface({
      supplier: scenario.supplier,
      appSupport: scenario.appSupport,
      companyPlace: companyTarget.publicCompany,
    })
    if (!supplier) {
      throw new Error(
        `Supplier Demo surface is incomplete: ${supplierId}`
      )
    }
    supplierIds.add(supplierId)

    return {
      ...scenario,
      supplier,
      companyPlace: companyTarget.publicCompany,
    }
  })
}
