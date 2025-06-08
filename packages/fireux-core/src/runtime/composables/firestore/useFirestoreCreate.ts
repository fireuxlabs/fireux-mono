import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../FireUXConfig'

export function useFirestoreCreate() {
  const db = useFirestore()
  const { tenantId } = useFireUXConfig()

  async function createDocument<T>(name: string, data: T): Promise<void> {
    const ref = collection(db, name)
    const stampedData = await stampDoc(data)
    await addDoc(ref, stampedData)
  }

  async function setDocument<T>(
    name: string,
    id: string,
    data: T
  ): Promise<void> {
    const ref = doc(db, name, id)
    const stampedData = await stampDoc(data)
    await setDoc(ref, stampedData)
  }

  function getCurrentUserId(): string {
    const currentUser = useCurrentUser().value

    if (!currentUser?.uid) {
      throw new Error('User is not authenticated.')
    }

    return currentUser.uid
  }

  async function stampDoc<T>(data: T): Promise<
    T & {
      tenant_id: string
      created_at: ReturnType<typeof serverTimestamp>
      creator_id: string
    }
  > {
    return {
      ...data,
      tenant_id: tenantId,
      created_at: serverTimestamp(),
      creator_id: getCurrentUserId(),
    }
  }

  return { createDocument, setDocument }
}
