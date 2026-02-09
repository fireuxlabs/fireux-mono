export interface FirestoreObject {
  slug: string
  appId: string
  created_at: string | Date
  updated_at: string | Date
  creator_id: string
}

export interface MiseEnPlaceObject extends Partial<FirestoreObject> {
  name: string
}

export const miseEnPlaceConfig = {
  collectionName: 'mise_items',
  objectType: 'MiseItem',
}
