import { computed, type ComputedRef } from 'vue'
import type { KitchenDemoDishSpec } from '../../../../demo/production'
import type { KitchenWorkspaceDemoScenario } from '../../core/useKitchenWorkspaceDemoData'
import {
  estimateKitchenDishFinance,
  type KitchenDishFinanceEstimate,
} from '../../../../utils/dish-finance'
import { useKitchenWorkspaceSupplyWorkspace } from '../Suppliers/useKitchenWorkspaceSupplyWorkspace'
import type { KitchenDishMenuUsage } from './useKitchenWorkspaceDishes'

export type {
  KitchenDishFinanceCostLine,
  KitchenDishFinanceEstimate,
} from '../../../../utils/dish-finance'

type UseKitchenWorkspaceDishFinanceOptions = {
  dishSpec: ComputedRef<KitchenDemoDishSpec | null>
  menuUsage: ComputedRef<KitchenDishMenuUsage[]>
  scenario: ComputedRef<KitchenWorkspaceDemoScenario | null>
}

export function useKitchenWorkspaceDishFinance(
  options: UseKitchenWorkspaceDishFinanceOptions
) {
  const supply = useKitchenWorkspaceSupplyWorkspace()
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
