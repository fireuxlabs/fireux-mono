export type KitchenDemoStationId =
  | 'prep'
  | 'grill'
  | 'fryers'
  | 'drinks'
  | 'pass'

export type KitchenDemoItemSpec = {
  id: string
  dishId: string
  station: KitchenDemoStationId
  portion?: string
  summary: string
  assembly: string[]
  components: KitchenDemoItemComponent[]
}

export type KitchenDemoProductionUnit = 'g' | 'ml' | 'each' | 'portion'

export type KitchenDemoProductionAmount = {
  quantity: number
  unit: KitchenDemoProductionUnit
}

type KitchenDemoItemComponentBase = KitchenDemoProductionAmount & {
  id: string
}

export type KitchenDemoItemIngredientComponent =
  KitchenDemoItemComponentBase & {
    source: 'ingredient'
    ingredientId: string
  }

export type KitchenDemoItemPrepItemComponent = KitchenDemoItemComponentBase & {
  source: 'prep_item'
  prepItemId: string
}

export type KitchenDemoItemRecipeComponent = KitchenDemoItemComponentBase & {
  source: 'recipe'
  recipeId: string
}

export type KitchenDemoItemComponent =
  | KitchenDemoItemIngredientComponent
  | KitchenDemoItemPrepItemComponent
  | KitchenDemoItemRecipeComponent

export type KitchenDemoMenuItemComponentDelta = {
  id: string
  menuId: string
  sectionId: string
  menuItemId: string
  choice:
    | {
        kind: 'price_option'
        id: string
        label: string
      }
    | {
        kind: 'add_on'
        id: string
        label?: never
      }
  components: KitchenDemoItemComponent[]
  componentMultiplier?: number
}

export type KitchenDemoProductionRecipe = {
  id: string
  name: string
  yield: KitchenDemoProductionAmount
  ingredients: KitchenDemoRecipeIngredient[]
  method: string[]
}

export type KitchenDemoRecipeIngredient = {
  ingredientId: string
  quantity: number
  unit: Exclude<KitchenDemoProductionUnit, 'portion'>
  preparation?: string
}

export type KitchenDemoPrepItem = {
  id: string
  name: string
  station: KitchenDemoStationId
  input: KitchenDemoRecipeIngredient
  yield: KitchenDemoProductionAmount
  method: string[]
}

export const formatKitchenDemoProductionAmount = (
  amount: KitchenDemoProductionAmount
) => `${amount.quantity} ${amount.unit}`
