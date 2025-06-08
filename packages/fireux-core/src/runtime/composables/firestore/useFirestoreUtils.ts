// ~/composables/firestore/useFirestoreUtils.ts
import { useFirestore, useCurrentUser } from 'vuefire'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useFireUXConfig } from '../FireUXConfig'

export function useFirestoreUtils() {
  const db = useFirestore()
  const { appName, appId } = useFireUXConfig()

  /**
   * Checks whether a given field/value pair is unique in a collection,
   * optionally scoped to the current tenant.
   */
  async function checkUnique(
    collectionName: string,
    field: string,
    value: string,
    tenantScoped = true
  ): Promise<boolean> {
    // Build base constraint
    const constraints = [where(field, '==', value)]

    // If tenant scoping is on, grab tenantId from runtime config
    if (tenantScoped) {
      constraints.push(where('tenant_id', '==', appId))
    }

    // Query and return whether any docs matched
    const q = query(collection(db, collectionName), ...constraints)
    const snapshot = await getDocs(q)
    return !snapshot.empty
  }

  function getCollectionPath(name: string): string {
    return `${appId}/${name}`
  }

  async function fetchDocumentsByField<T>(
    collectionName: string,
    field: string,
    value: unknown
  ): Promise<T[]> {
    const constraints = [where(field, '==', value)]
    constraints.push(where('tenant_id', '==', appId))
    const q = query(collection(db, collectionName), ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => doc.data() as T)
  }

  /**
   * Fetches a single document by a specific field and value.
   */
  async function firestoreQueryOneByField<T>(
    collectionName: string,
    field: string,
    value: string
  ): Promise<T | null> {
    const constraints = [
      where(field, '==', value),
      where('tenant_id', '==', appId),
    ]
    const q = query(collection(db, collectionName), ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.empty ? null : (snapshot.docs[0].data() as T)
  }

  /**
   * Fetches a subcollection of documents for a given parent document.
   */
  async function firestoreFetchSubcollection<T>(
    parentCollection: string,
    parentId: string,
    subcollectionName: string
  ): Promise<T[]> {
    const subcollectionRef = collection(
      db,
      `${parentCollection}/${parentId}/${subcollectionName}`
    )
    const snapshot = await getDocs(subcollectionRef)
    return snapshot.docs.map((doc) => doc.data() as T)
  }

  /**
   * Waits for the current user to be available, with an optional timeout.
   */
  async function waitForCurrentUser(
    timeout = 5000
  ): Promise<ReturnType<typeof useCurrentUser>['value']> {
    const currentUser = useCurrentUser()
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const checkUser = () => {
        if (currentUser.value && currentUser.value.uid) {
          resolve(currentUser.value)
        } else if (Date.now() - startTime > timeout) {
          console.error('Timeout waiting for current user or invalid user')
          reject(new Error('Timeout waiting for current user or invalid user'))
        } else {
          setTimeout(checkUser, 50)
        }
      }

      checkUser()
    })
  }

  return {
    checkUnique,
    getCollectionPath,
    fetchDocumentsByField,
    firestoreQueryOneByField,
    firestoreFetchSubcollection,
    waitForCurrentUser,
  }
}
