import type {
  Ingredient,
  KitchenIngredient,
} from '../../models/ingredient.model'
import type { KitchenMiseTask } from '../../models/kitchen-mise.model'
import type { Kitchen } from '../../models/kitchen.model'
import type { Dish } from '../../models/dish.model'
import type { Menu } from '../../models/menu.model'
import type { ReadOnlySupplierIngredient } from './packs/suppliers.pack'

type JsonDoc = Record<string, unknown>

export type ReadOnlyScenarioMeta = {
  id: string
  name: string
  address_label: string
  image_url: string
  mode: 'read-only'
}

export type ReadOnlyMenuStack = {
  ingredientIds: Record<string, string>
  stations: JsonDoc[]
  menus: Menu[]
  dishes: Dish[]
  recipes: JsonDoc[]
  miseTasks: KitchenMiseTask[]
}

export type ReadOnlyProcurementStack = {
  suppliers: ReadOnlySupplier[]
  supplierIngredients: ReadOnlySupplierIngredientRecord[]
  purchases: JsonDoc[]
}

export type ReadOnlySupplier = {
  id: string
  kitchen_id: string
  name: string
  short_name: string
  image_url: string
}

export type ReadOnlySupplierIngredientRecord = ReadOnlySupplierIngredient & {
  id: string
  kitchen_id: string
  ingredient_id: string
}

export type ReadOnlyServiceStack = {
  incomingOrders: JsonDoc[]
}

export type ReadOnlyTrainingStack = {
  modules: JsonDoc[]
}

export type ReadOnlyHaccpStack = {
  checks: JsonDoc[]
}

export type ReadOnlyKitchenScenario = {
  meta: ReadOnlyScenarioMeta
  kitchen: Kitchen
  globalIngredients: Ingredient[]
  kitchenIngredients: KitchenIngredient[]
  teamMembers: JsonDoc[]
  competencyGroups: JsonDoc[]
  stacks: {
    menu: ReadOnlyMenuStack
    procurement: ReadOnlyProcurementStack
    service: ReadOnlyServiceStack
    training: ReadOnlyTrainingStack
    haccp: ReadOnlyHaccpStack
  }
}
