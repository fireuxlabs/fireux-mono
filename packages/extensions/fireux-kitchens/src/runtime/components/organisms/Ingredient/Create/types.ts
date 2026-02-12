export type IngredientCreateForm = {
  name: string
  image_url: string
}

export const createDefaultIngredientForm = (): IngredientCreateForm => ({
  name: '',
  image_url: '',
})
