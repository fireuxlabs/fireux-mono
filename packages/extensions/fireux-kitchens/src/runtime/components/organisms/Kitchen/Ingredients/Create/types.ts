export type KitchenIngredientCreateForm = {
  name: string
}

export const createDefaultKitchenIngredientForm = (): KitchenIngredientCreateForm => ({
  name: '',
})
