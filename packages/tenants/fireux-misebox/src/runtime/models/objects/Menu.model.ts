import type { FirestoreObject } from '#fireux-core-models/objects/object.model'

export interface MenuObject extends Partial<FirestoreObject> {
  name: string
}

export const menuConfig = {
  collectionName: 'menus',
  objectType: 'Menu',
}
