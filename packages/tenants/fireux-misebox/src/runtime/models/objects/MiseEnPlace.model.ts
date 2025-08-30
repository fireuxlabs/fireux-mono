import type { FirestoreObject } from './object.model'

export interface MiseEnPlaceObject extends Partial<FirestoreObject> {
  name: string
}

export const miseEnPlaceConfig = {
  collectionName: 'mise_items',
  objectType: 'MiseItem',
}
