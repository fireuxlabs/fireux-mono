import { useFirestoreManager } from '../useFirestoreManager'
import { useObjectCreate } from './useObjectCreate'
import { useObjectDelete } from './useObjectDelete'
import { useObjectUpdate } from './useObjectUpdate'
import type { ObjectConfig } from '../../../models/objects/object.model'

/**
 * Shared composable for object CRUD operations and state management
 * This is the unified entry point for all object types (Product, Blog, Job, Kitchen, etc.)
 */
export async function useObject(objectConfig: ObjectConfig) {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  // Use the provided config directly
  const config = objectConfig

  // Fetch all objects in this collection - await the Promise
  const allObjects = await firestoreFetchCollection(config.collectionName)

  async function fetchById(id: string) {
    return await firestoreFetchDoc(config.collectionName, id)
  }

  // Expose create functionality
  const objectCreate = useObjectCreate()

  // Expose delete functionality
  const objectDelete = useObjectDelete()

  // Expose update functionality
  const objectUpdate = useObjectUpdate()

  // Additional object-specific functionality (if provided in config)
  const objectExtensions = config.createComposable
    ? config.createComposable()
    : {}
  const objectUpdates = config.updateComposable ? config.updateComposable() : {}
  const objectDeletes = config.deleteComposable ? config.deleteComposable() : {}

  const returnObject = {
    [`${config.collectionName}`]: allObjects,
    [`fetch${config.objectType || 'Object'}`]: fetchById,
    all: allObjects, // Add alias for easier destructuring
    ...objectCreate,
    ...objectDelete,
    ...objectUpdate,
    ...objectExtensions,
    ...objectUpdates,
    ...objectDeletes,
  }

  return returnObject
}
