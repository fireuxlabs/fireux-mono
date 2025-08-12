import type { FirestoreObject } from './object.model'

export interface RecipeSimpleObject extends Partial<FirestoreObject> {
  name: string
}

export const recipeSimpleConfig = {
  collectionName: 'recipes',
  objectType: 'Recipe',
}
