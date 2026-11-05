import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Supplier } from '../models/Supplier.model.ts'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../composables/firestore/utils/view/useSupplierInterface'

type SupplierBusinessDemoTargetLike = {
  business: {
    id?: string | null
    place_ids: readonly string[]
  }
  place: {
    id?: string | null
  }
  resolvedPlace: Place
}

type SupplierDemoScenarioLike = {
  supplier: Supplier
}

export type ProjectedSupplierDemoScenario<
  TScenario extends SupplierDemoScenarioLike,
> = Omit<TScenario, 'supplier'> & {
  supplier: SupplierSurface
  businessPlace: Place
}

const clean = (value: unknown) => String(value ?? '').trim()

export function projectSupplierDemoWorld<
  TScenario extends SupplierDemoScenarioLike,
>(input: {
  scenarios: readonly TScenario[]
  businessTargets: readonly SupplierBusinessDemoTargetLike[]
}): ProjectedSupplierDemoScenario<TScenario>[] {
  const businessTargetById = new Map<string, SupplierBusinessDemoTargetLike>()
  for (const target of input.businessTargets) {
    const businessId = clean(target.business.id)
    if (
      !businessId ||
      businessTargetById.has(businessId) ||
      !target.business.place_ids.includes(clean(target.place.id)) ||
      clean(target.resolvedPlace.id) !== clean(target.place.id)
    ) {
      throw new Error(
        `Supplier Demo Business/Place target is invalid: ${businessId || '(missing-id)'}`
      )
    }
    businessTargetById.set(businessId, target)
  }

  const { surface } = useSupplierInterface()
  const supplierIds = new Set<string>()
  return input.scenarios.map((scenario) => {
    const supplierId = clean(scenario.supplier.id)
    const businessId = clean(scenario.supplier.business_id)
    const businessTarget = businessTargetById.get(businessId)
    if (
      !supplierId ||
      supplierIds.has(supplierId) ||
      !businessTarget ||
      'place_id' in scenario.supplier
    ) {
      throw new Error(
        `Supplier Demo Business/Place relationship is unresolved: ${
          supplierId || '(missing-id)'
        }`
      )
    }

    const supplier = surface({
      supplier: scenario.supplier,
      businessPlace: businessTarget.resolvedPlace,
    })
    if (!supplier) {
      throw new Error(`Supplier Demo surface is incomplete: ${supplierId}`)
    }
    supplierIds.add(supplierId)

    return {
      ...scenario,
      supplier,
      businessPlace: businessTarget.resolvedPlace,
    }
  })
}
