import type { FirestoreObject } from 'fireux-core/runtime/models/objects/object.model'

export interface DishObject extends Partial<FirestoreObject> {
  name: string
}

export const dishConfig = {
  collectionName: 'dishes',
  objectType: 'Dish',
}
