import type { FirestoreObject } from './object.model'

export interface IngredientObject extends Partial<FirestoreObject> {
  name: string
}

export const ingredientConfig = {
  collectionName: 'ingredients',
  objectType: 'Ingredient',
}
