import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../FireUXConfig'

export async function stampDoc<T>(
  data: T,
  opts?: { appScoped?: boolean }
): Promise<
  T & {
    appId?: string
    created_at: ReturnType<typeof serverTimestamp>
    creator_id: string
  }
> {
  const { appId } = useFireUXConfig()
  function getCurrentUserId(): string {
    const currentUser = useCurrentUser().value
    if (!currentUser?.uid) {
      throw new Error('User is not authenticated.')
    }
    return currentUser.uid
  }
  const base = {
    ...data,
    created_at: serverTimestamp(),
    creator_id: getCurrentUserId(),
  }
  if (opts?.appScoped === false) {
    return base
  }
  return {
    ...base,
    appId: appId,
  }
}

export function useFirestoreCreate() {
  const db = useFirestore()

  async function createDocument<T>(
    name: string,
    data: T,
    opts?: { appScoped?: boolean }
  ): Promise<void> {
    const ref = collection(db, name)
    const stampedData = await stampDoc(data, opts)
    await addDoc(ref, stampedData)
  }

  async function setDocument<T>(
    name: string,
    id: string,
    data: T,
    opts?: { appScoped?: boolean }
  ): Promise<void> {
    const ref = doc(db, name, id)
    const stampedData = await stampDoc(data, opts)
    await setDoc(ref, stampedData)
  }

  return { createDocument, setDocument }
}
