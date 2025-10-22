// ~/composables/firestore/useFirestoreUtils.ts
import { useFirestore } from 'vuefire'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useFireUXConfig } from '../FireUXConfig'

export function useFirestoreUtils() {
  /**
   * Checks whether a given field/value pair is unique in a collection,
   * optionally scoped to the current app.
   */
  const checkUnique = async (
    collectionName: string,
    field: string,
    value: string,
    appScoped = true
  ): Promise<boolean> => {
    const db = useFirestore()
    const { appId } = useFireUXConfig()
    // Build base constraint
    const constraints = [where(field, '==', value)]
    // If app scoping is on, grab appId from runtime config
    if (appScoped) {
      constraints.push(where('appId', '==', appId))
    }
    // Query and return whether any docs matched
    const q = query(collection(db, collectionName), ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.empty
  }

  const getCollectionPath = (name: string): string => {
    const { appId } = useFireUXConfig()
    return `${appId}/${name}`
  }

  const fetchDocumentsByField = async <T>(
    collectionName: string,
    field: string,
    value: unknown,
    appScoped = true
  ): Promise<T[]> => {
    const db = useFirestore()
    const { appId } = useFireUXConfig()
    const constraints = [where(field, '==', value)]
    if (appScoped) {
      constraints.push(where('appId', '==', appId))
    }
    const q = query(collection(db, collectionName), ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => doc.data() as T)
  }

  /**
   * Fetches a single document by a specific field and value.
   */
  const firestoreQueryOneByField = async <T>(
    collectionName: string,
    field: string,
    value: string,
    appScoped = true
  ): Promise<T | null> => {
    const db = useFirestore()
    const { appId } = useFireUXConfig()
    const constraints = [where(field, '==', value)]
    if (appScoped) {
      constraints.push(where('appId', '==', appId))
    }
    const q = query(collection(db, collectionName), ...constraints)
    const snapshot = await getDocs(q)
    if (snapshot.empty || !snapshot.docs[0]) return null
    return snapshot.docs[0].data() as T
  }

  /**
   * Fetches a subcollection of documents for a given parent document.
   */
  const firestoreFetchSubcollection = async <T>(
    parentCollection: string,
    parentId: string,
    subcollectionName: string
  ): Promise<T[]> => {
    const db = useFirestore()
    const subcollectionRef = collection(
      db,
      `${parentCollection}/${parentId}/${subcollectionName}`
    )
    const snapshot = await getDocs(subcollectionRef)
    return snapshot.docs.map((doc) => doc.data() as T)
  }

  return {
    checkUnique,
    getCollectionPath,
    fetchDocumentsByField,
    firestoreQueryOneByField,
    firestoreFetchSubcollection,
  }
}
