import type { FirestoreObject } from 'fireux-core/runtime/models/objects/object.model.ts'

export interface MenuObject extends Partial<FirestoreObject> {
  name: string
}

export const menuConfig = {
  collectionName: 'menus',
  objectType: 'Menu',
}
