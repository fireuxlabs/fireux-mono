import type {
  Ingredient,
  KitchenIngredient as KitchenIngredientDoc,
} from 'fireux-kitchens/runtime/models/ingredient.model'
import type { Dish as DishDoc } from 'fireux-kitchens/runtime/models/dish.model'
import type { Menu as MenuDoc } from 'fireux-kitchens/runtime/models/menu.model'
import type { KitchenMiseTask as KitchenMiseTaskDoc } from 'fireux-kitchens/runtime/models/kitchen-mise.model'
import type { Kitchen } from '../../../../../../models/kitchen.model'

export type DummyRecipe = {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'archived'
  yield_qty: number
  yield_unit: string
  prep_minutes: number
  cook_minutes: number
  ingredient_lines: Array<{ ingredient_name: string; quantity: number; unit: string }>
  steps: Array<{ order: number; title: string }>
}

export type DummyScenario = {
  kitchen: Kitchen
  globalIngredients: Ingredient[]
  kitchenIngredients: KitchenIngredientDoc[]
  teamMembers: Array<Record<string, unknown>>
  competencyGroups?: Array<Record<string, unknown>>
  menuStack: {
    kitchenId: string
    ingredientIds: Record<string, string>
    stations: Array<Record<string, unknown>>
    recipes: DummyRecipe[]
    miseTasks: KitchenMiseTaskDoc[]
    dishes: DishDoc[]
    menus: MenuDoc[]
  }
  procurementStack: {
    kitchenId: string
    suppliers: Array<Record<string, unknown>>
    supplierIngredients: Array<Record<string, unknown>>
    purchases: Array<Record<string, unknown>>
  }
  serviceStack: {
    kitchenId: string
    incomingOrders: Array<Record<string, unknown>>
  }
  trainingStack: {
    kitchenId: string
    modules: Array<Record<string, unknown>>
  }
  haccpStack: {
    kitchenId: string
    checks: Array<Record<string, unknown>>
  }
}
