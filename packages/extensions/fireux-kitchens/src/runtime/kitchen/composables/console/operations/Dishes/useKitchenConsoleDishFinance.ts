import { computed, type ComputedRef } from 'vue'
import type { KitchenDemoDishSpec } from '../../../../demo/production'
import type { KitchenConsoleDemoScenario } from '../../core/useKitchenConsoleDemoData'
import {
  estimateKitchenDishFinance,
  type KitchenDishFinanceEstimate,
} from '../../../../utils/dish-finance'
import { useKitchenConsoleSupplyWorkspace } from '../Suppliers/useKitchenConsoleSupplyWorkspace'
import type { KitchenDishMenuUsage } from './useKitchenConsoleDishes'

export type {
  KitchenDishFinanceCostLine,
  KitchenDishFinanceEstimate,
} from '../../../../utils/dish-finance'

type UseKitchenConsoleDishFinanceOptions = {
  dishSpec: ComputedRef<KitchenDemoDishSpec | null>
  menuUsage: ComputedRef<KitchenDishMenuUsage[]>
  scenario: ComputedRef<KitchenConsoleDemoScenario | null>
}

export function useKitchenConsoleDishFinance(
  options: UseKitchenConsoleDishFinanceOptions
) {
  const supply = useKitchenConsoleSupplyWorkspace()
  const estimate = computed<KitchenDishFinanceEstimate | null>(() => {
    const dishSpec = options.dishSpec.value
    const scenario = options.scenario.value
    if (!dishSpec || !scenario || supply.pending.value) return null
    return estimateKitchenDishFinance({
      dishSpec,
      menuUsage: options.menuUsage.value,
      scenario,
      supplyLineByIngredientId: supply.supplyLineByIngredientId.value,
    })
  })

  return {
    estimate,
    pending: supply.pending,
    error: computed(
      () => supply.supplierDemoError.value ?? supply.ingredientRootError.value
    ),
  }
}
