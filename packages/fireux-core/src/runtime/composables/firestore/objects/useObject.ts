// ~/composables/firestore/objects/useObject.ts

import { ref, type Ref } from 'vue'
import { useFirestoreManager } from '../useFirestoreManager'
import type {
  FirestoreObject,
  ObjectConfig,
} from '../../../models/objects/object.model'

/**
 * Shared composable for object CRUD operations and state management
 * This is the unified entry point for all object types (Product, Blog, etc.)
 */
export async function useObject<T extends FirestoreObject>(
  objectConfig: ObjectConfig
) {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  // Fetch collection
  const objectsCollection =
    (await firestoreFetchCollection<T>(objectConfig.collectionName)) || ref([])

  // Fetch by ID/slug
  async function fetchObject(id: string): Promise<Ref<T | null | undefined>> {
    return await firestoreFetchDoc(objectConfig.collectionName, id)
  }

  // Expose create functionality (if provided in config)
  const objectCreate = objectConfig.createComposable
    ? objectConfig.createComposable()
    : {}

  // Expose update functionality (if provided in config)
  const objectUpdate = objectConfig.updateComposable
    ? objectConfig.updateComposable()
    : {}

  // Expose delete functionality (if provided in config)
  const objectDelete = objectConfig.deleteComposable
    ? objectConfig.deleteComposable()
    : {}

  return {
    objectsCollection,
    fetchObject,
    ...objectCreate,
    ...objectUpdate,
    ...objectDelete,
  }
}
