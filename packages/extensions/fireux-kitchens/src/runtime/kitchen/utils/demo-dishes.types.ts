import type {
  SupplierIngredient,
  SupplierItem,
} from 'fireux-suppliers/runtime/supplier/models/Supplier.model'
import type { Dish } from '../models/dish.model.ts'
import type { KitchenDemoScenario } from '../demo/core/types'
import type {
  KitchenDemoDishSpec,
  KitchenDemoMiseRequirement,
  KitchenDemoPrepItem,
  KitchenDemoProductionRecipe,
} from '../demo/production'
import type { KitchenDishFinanceEstimate } from './dish-finance'

export type KitchenDemoDishMenuUsage = {
  dishId: string
  menuId: string
  sectionId: string
  itemId: string
  price?: number
  currencyCode?: string
  menuName?: string
  sectionLabel?: string
  active?: boolean
}

export type KitchenDemoDishSection = {
  id: string
  label: string
  dishIds: string[]
  count: number
}

export type KitchenDemoDishComponentView = {
  id: string
  name: string
  amount: string
  sourceLabel: 'Ingredient' | 'Prep item' | 'Recipe'
}

export type KitchenDemoDishOperationItem = {
  dish: Dish
  spec: KitchenDemoDishSpec | null
  componentViews: KitchenDemoDishComponentView[]
  menuUsage: KitchenDemoDishMenuUsage[]
  prepItems: KitchenDemoPrepItem[]
  recipes: KitchenDemoProductionRecipe[]
  miseRequirements: KitchenDemoMiseRequirement[]
  finance: KitchenDishFinanceEstimate | null
  quantitySold: number | null
  totalSalesMinor: number | null
}

export type KitchenDemoDishesOperation = {
  dishes: Dish[]
  ingredientNameById: Record<string, string>
  stationNameById: Record<string, string>
  items: KitchenDemoDishOperationItem[]
  sections: KitchenDemoDishSection[]
}

export type KitchenDemoDishesSupplierScenario = {
  supplier: {
    id?: string | null
    supplier_organization_name?: string | null
  }
  ingredients: readonly SupplierIngredient[]
  items: readonly SupplierItem[]
}

export type KitchenDemoDishesScenario = Pick<
  KitchenDemoScenario,
  | 'dishFinance'
  | 'dishes'
  | 'dishSpecs'
  | 'kitchenIngredients'
  | 'menus'
  | 'miseRequirements'
  | 'place'
  | 'prepItems'
  | 'recipes'
  | 'stations'
  | 'supplierIngredientLinks'
>
