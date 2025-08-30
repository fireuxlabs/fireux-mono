import type { FirestoreObject } from './object.model'

export interface TaskObject extends Partial<FirestoreObject> {
  name: string
}

export const taskConfig = {
  collectionName: 'kitchen_tasks',
  objectType: 'Task',
}
