import type {
  SupplierIngredient,
  SupplierItem,
} from 'fireux-suppliers/runtime/supplier/models/Supplier.model'
import type { Item } from './item.ts'
import type { KitchenDemoScenario } from '../demo/core/types'
import type {
  KitchenDemoItemSpec,
  KitchenDemoPrepItem,
  KitchenDemoProductionRecipe,
} from '../demo/production'
import type { KitchenItemFinanceEstimate } from './item-finance'

export type KitchenDemoItemMenuUsage = {
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

export type KitchenDemoItemSection = {
  id: string
  label: string
  itemIds: string[]
  count: number
}

export type KitchenDemoItemComponentView = {
  id: string
  name: string
  amount: string
  sourceLabel: 'Ingredient' | 'Prep item' | 'Recipe'
}

export type KitchenDemoItemOperationItem = {
  dish: Item
  spec: KitchenDemoItemSpec | null
  componentViews: KitchenDemoItemComponentView[]
  menuUsage: KitchenDemoItemMenuUsage[]
  prepItems: KitchenDemoPrepItem[]
  recipes: KitchenDemoProductionRecipe[]
  finance: KitchenItemFinanceEstimate | null
  quantitySold: number | null
  totalSalesMinor: number | null
}

export type KitchenDemoItemsOperation = {
  dishes: Item[]
  ingredientNameById: Record<string, string>
  stationNameById: Record<string, string>
  items: KitchenDemoItemOperationItem[]
  sections: KitchenDemoItemSection[]
}

export type KitchenDemoItemsSupplierScenario = {
  supplier: {
    id?: string | null
    business_place?: {
      name?: string | null
      short_name?: string | null
    }
  }
  ingredients: readonly SupplierIngredient[]
  items: readonly SupplierItem[]
}

export type KitchenDemoItemsScenario = Pick<
  KitchenDemoScenario,
  | 'itemFinance'
  | 'dishes'
  | 'itemSpecs'
  | 'kitchenIngredients'
  | 'menus'
  | 'kitchen'
  | 'place'
  | 'prepItems'
  | 'recipes'
  | 'stations'
  | 'supplierIngredientLinks'
>
