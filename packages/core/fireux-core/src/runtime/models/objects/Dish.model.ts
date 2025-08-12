import type { FirestoreObject } from './object.model'

export interface DishObject extends Partial<FirestoreObject> {
  name: string
}

export const dishConfig = {
  collectionName: 'dishes',
  objectType: 'Dish',
}
