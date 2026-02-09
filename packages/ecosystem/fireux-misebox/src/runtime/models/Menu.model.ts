export interface FirestoreObject {
  slug: string
  appId: string
  created_at: string | Date
  updated_at: string | Date
  creator_id: string
}

export interface MenuObject extends Partial<FirestoreObject> {
  name: string
}

export const menuConfig = {
  collectionName: 'menus',
  objectType: 'Menu',
}
