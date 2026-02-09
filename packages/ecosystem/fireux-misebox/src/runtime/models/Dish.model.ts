export interface FirestoreObject {
  slug: string
  appId: string
  created_at: string | Date
  updated_at: string | Date
  creator_id: string
}

export interface DishObject extends Partial<FirestoreObject> {
  name: string
}

export const dishConfig = {
  collectionName: 'dishes',
  objectType: 'Dish',
}
