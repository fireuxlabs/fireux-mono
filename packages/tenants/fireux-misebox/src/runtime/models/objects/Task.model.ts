import type { FirestoreObject } from 'fireux-core/runtime/models/objects/object.model.ts'

export interface TaskObject extends Partial<FirestoreObject> {
  name: string
}

export const taskConfig = {
  collectionName: 'kitchen_tasks',
  objectType: 'Task',
}
