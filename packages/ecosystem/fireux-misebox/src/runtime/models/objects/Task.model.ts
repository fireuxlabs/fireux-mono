export interface FirestoreObject {
  slug: string
  appId: string
  created_at: string | Date
  updated_at: string | Date
  creator_id: string
}

export interface TaskObject extends Partial<FirestoreObject> {
  name: string
}

export const taskConfig = {
  collectionName: 'kitchen_tasks',
  objectType: 'Task',
}
