export type KitchenDemoStationId =
  | 'prep'
  | 'grill'
  | 'fryers'
  | 'drinks'
  | 'pass'

export type KitchenDemoDishSpec = {
  id: string
  dishId: string
  station: KitchenDemoStationId
  portion?: string
  summary: string
  assembly: string[]
  components: KitchenDemoDishComponent[]
}

export type KitchenDemoProductionUnit = 'g' | 'ml' | 'each' | 'portion'

export type KitchenDemoProductionAmount = {
  quantity: number
  unit: KitchenDemoProductionUnit
}

type KitchenDemoDishComponentBase = KitchenDemoProductionAmount & {
  id: string
}

export type KitchenDemoDishIngredientComponent =
  KitchenDemoDishComponentBase & {
    source: 'ingredient'
    ingredientId: string
  }

export type KitchenDemoDishPrepItemComponent = KitchenDemoDishComponentBase & {
  source: 'prep_item'
  prepItemId: string
}

export type KitchenDemoDishRecipeComponent = KitchenDemoDishComponentBase & {
  source: 'recipe'
  recipeId: string
}

export type KitchenDemoDishComponent =
  | KitchenDemoDishIngredientComponent
  | KitchenDemoDishPrepItemComponent
  | KitchenDemoDishRecipeComponent

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
  components: KitchenDemoDishComponent[]
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

type KitchenDemoMiseRequirementSource =
  | {
      kind: 'prep_item'
      prepItemId: string
    }
  | {
      kind: 'recipe'
      recipeId: string
    }

export type KitchenDemoMiseRequirement = {
  id: string
  title: string
  station: KitchenDemoStationId
  amount: KitchenDemoProductionAmount
  source: KitchenDemoMiseRequirementSource
}

export const formatKitchenDemoProductionAmount = (
  amount: KitchenDemoProductionAmount
) => `${amount.quantity} ${amount.unit}`
