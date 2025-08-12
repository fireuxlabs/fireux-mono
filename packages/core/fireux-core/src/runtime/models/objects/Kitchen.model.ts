import type { FirestoreObject } from './object.model'

export interface KitchenObject extends Partial<FirestoreObject> {
  name: string
}

export const kitchenConfig = {
  collectionName: 'kitchens',
  objectType: 'Kitchen',
}
