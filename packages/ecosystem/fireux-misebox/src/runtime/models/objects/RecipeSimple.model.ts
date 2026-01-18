export interface FirestoreObject {
  slug: string
  appId: string
  created_at: string | Date
  updated_at: string | Date
  creator_id: string
}

export interface RecipeSimpleObject extends Partial<FirestoreObject> {
  name: string
}

export const recipeSimpleConfig = {
  collectionName: 'recipes',
  objectType: 'Recipe',
}
