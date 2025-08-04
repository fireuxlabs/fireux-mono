// ~/composables/useFirestoreManager.ts

import { useFirestoreRead } from './useFirestoreRead'
import { useFirestoreCreate } from './useFirestoreCreate'
import { useFirestoreUpdate } from './useFirestoreUpdate'
import { useFirestoreDelete } from './useFirestoreDelete'
import { useFirestoreUtils } from './useFirestoreUtils'

export function useFirestoreManager() {
  const firestoreUtils = useFirestoreUtils()

  // Lazy wrapper functions to avoid calling composables at top level
  function firestoreFetchCollection<T>(collectionPath: string) {
    const { firestoreFetchCollection } = useFirestoreRead()
    return firestoreFetchCollection<T>(collectionPath)
  }

  function firestoreFetchDoc<T>(collectionPath: string, docId: string) {
    const { firestoreFetchDoc } = useFirestoreRead()
    return firestoreFetchDoc<T>(collectionPath, docId)
  }

  function setDocument<T>(
    collectionName: string,
    docId: string,
    data: T,
    options?: any
  ) {
    const { setDocument } = useFirestoreCreate()
    return setDocument<T>(collectionName, docId, data, options)
  }

  function updateDocument<T extends { updated_at?: unknown }>(
    collectionName: string,
    docId: string,
    data: Partial<T>,
    options?: any
  ) {
    const { updateDocument } = useFirestoreUpdate()
    return updateDocument<T>(collectionName, docId, data, options)
  }

  function deleteDocument(
    collectionName: string,
    docId: string,
    options?: any
  ) {
    const { deleteDocument } = useFirestoreDelete()
    return deleteDocument(collectionName, docId, options)
  }

  return {
    firestoreFetchCollection,
    firestoreFetchDoc,
    setDocument,
    updateDocument,
    deleteDocument,
    ...firestoreUtils,
  }
}
