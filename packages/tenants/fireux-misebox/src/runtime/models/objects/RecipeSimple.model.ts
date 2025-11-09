import type { FirestoreObject } from 'fireux-core/runtime/models/objects/object.model.ts'

export interface RecipeSimpleObject extends Partial<FirestoreObject> {
  name: string
}

export const recipeSimpleConfig = {
  collectionName: 'recipes',
  objectType: 'Recipe',
}
