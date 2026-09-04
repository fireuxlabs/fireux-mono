import { collection, getDocs, query, where } from 'firebase/firestore'
import { useFirestore } from '../vuefire'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'

/** Build an optionally App-scoped collection path. */
const resolveCollectionPath = (
  name: string,
  appScoped: boolean,
  appId?: string | null
) => {
  if (appScoped) {
    if (!appId) {
      throw new Error(
        `[firestore/utils] missing appId for App-scoped path "${name}"`
      )
    }
    return `apps/${appId}/${name}`
  }

  return name
}

export function useFirestoreUtils() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  /** Checks whether a field/value pair is unique in an optional App scope. */
  const checkUnique = async (
    collectionName: string,
    field: string,
    value: unknown,
    appScoped = true
  ): Promise<boolean> => {
    const colPath = resolveCollectionPath(collectionName, appScoped, appId)
    const colRef = collection(db, colPath)
    const q = query(colRef, where(field, '==', value))
    const snapshot = await getDocs(q)
    return snapshot.empty
  }

  /** Returns an optionally App-scoped collection path for downstream callers. */
  const getCollectionPath = (name: string, appScoped = true): string =>
    resolveCollectionPath(name, appScoped, appId)

  /** Fetch multiple docs by field match (optionally App-scoped). */
  const fetchDocumentsByField = async <T>(
    collectionName: string,
    field: string,
    value: unknown,
    appScoped = true
  ): Promise<T[]> => {
    const colPath = resolveCollectionPath(collectionName, appScoped, appId)
    const colRef = collection(db, colPath)
    const q = query(colRef, where(field, '==', value))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => doc.data() as T)
  }

  /** Fetch a single doc by field match (optionally App-scoped). */
  const firestoreQueryOneByField = async <T>(
    collectionName: string,
    field: string,
    value: unknown,
    appScoped = true
  ): Promise<T | null> => {
    const colPath = resolveCollectionPath(collectionName, appScoped, appId)
    const colRef = collection(db, colPath)
    const q = query(colRef, where(field, '==', value))
    const snapshot = await getDocs(q)
    return snapshot.empty ? null : (snapshot.docs[0].data() as T)
  }

  /** Fetch an entire subcollection under a given parent document. */
  const firestoreFetchSubcollection = async <T>(
    parentCollection: string,
    parentId: string,
    subcollectionName: string
  ): Promise<T[]> => {
    const colPath = `${parentCollection}/${parentId}/${subcollectionName}`
    const colRef = collection(db, colPath)
    const snapshot = await getDocs(colRef)
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
