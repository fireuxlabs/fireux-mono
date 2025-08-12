import { useFirestoreManager } from '../useFirestoreManager'
import { useObjectCreate } from './useObjectCreate'
import { useObjectDelete } from './useObjectDelete'
import { useObjectUpdate } from './useObjectUpdate'
import type { ObjectConfig } from '../../../models/objects/object.model'
import { useFirestore, useCurrentUser, useDocument } from 'vuefire'
import { doc } from 'firebase/firestore'

/**
 * Shared composable for object CRUD operations and state management
 * This is the unified entry point for all object types (Product, Blog, Job, Kitchen, etc.)
 */
export async function useObject(objectConfig: ObjectConfig) {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()
  const currentUser = useCurrentUser()
  const db = useFirestore()

  // Use the provided config directly
  const config = objectConfig

  // Fetch all objects in this collection (collection-level list)
  const allObjects = await firestoreFetchCollection(config.collectionName)

  // If userScoped, bind a current document keyed by uid
  const currentDocRef = computed(() =>
    config.userScoped && currentUser.value?.uid
      ? doc(db, config.collectionName, currentUser.value.uid)
      : null
  )
  const { data: current } = useDocument(currentDocRef)

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
    all: allObjects, // generic collection alias (preferred)
    collection: allObjects, // secondary alias
    current, // only populated if userScoped
    [`fetch${config.objectType || 'Object'}`]: fetchById,
    ...objectCreate,
    ...objectDelete,
    ...objectUpdate,
    ...objectExtensions,
    ...objectUpdates,
    ...objectDeletes,
  }

  return returnObject
}
