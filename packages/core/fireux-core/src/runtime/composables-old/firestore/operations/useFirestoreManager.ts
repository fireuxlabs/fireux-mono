import { useFirestoreRead } from './useFirestoreRead'
import { useFirestoreCreate } from './useFirestoreCreate'
import { useFirestoreUpdate } from './useFirestoreUpdate'
import { useFirestoreDelete } from './useFirestoreDelete'
import { useFirestoreUtils } from '../utils/useFirestoreUtils'

export function useFirestoreManager() {
  const firestoreUtils = useFirestoreUtils()

  function firestoreFetchCollection<T>(collectionPath: string) {
    const { firestoreFetchCollection } = useFirestoreRead()
    return firestoreFetchCollection<T>(collectionPath)
  }

  function firestoreFetchDoc<T>(collectionPath: string, docId: string) {
    const { firestoreFetchDoc } = useFirestoreRead()
    return firestoreFetchDoc<T>(collectionPath, docId)
  }

  function setDocument<T>(
    collectionPath: string,
    docId: string,
    data: T,
    options?: any
  ) {
    const { setDocument } = useFirestoreCreate()
    return setDocument<T>(collectionPath, docId, data, options)
  }

  function updateDocument<T extends { updated_at?: unknown }>(
    collectionPath: string,
    docId: string,
    data: Partial<T>
  ) {
    const { updateDocument } = useFirestoreUpdate()
    return updateDocument<T>(collectionPath, docId, data)
  }

  function deleteDocument(collectionPath: string, docId: string) {
    const { deleteDocument } = useFirestoreDelete()
    return deleteDocument(collectionPath, docId)
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
