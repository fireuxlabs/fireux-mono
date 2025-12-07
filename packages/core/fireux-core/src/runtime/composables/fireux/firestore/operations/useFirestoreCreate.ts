import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useRequireUser } from '../../firebase/useRequireUser'

type Stamped<T> = T & {
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
  creator_id: string
}

export async function stampDoc<T>(
  data: T,
  opts?: { raw?: boolean }
): Promise<T | Stamped<T>> {
  if (opts?.raw) return data
  const user = await useRequireUser()
  return {
    ...(data as any),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    creator_id: user.uid,
  }
}

export function useFirestoreCreate() {
  const db = useFirestore()

  async function createDocument<T>(
    collectionPath: string,
    data: T,
    opts?: { raw?: boolean }
  ): Promise<void> {
    const ref = collection(db, collectionPath)
    const stamped = await stampDoc(data, opts)
    await addDoc(ref, stamped as any)
  }

  async function setDocument<T>(
    collectionPath: string,
    id: string,
    data: T,
    opts?: { raw?: boolean }
  ): Promise<void> {
    const ref = doc(db, collectionPath, id)
    const stamped = await stampDoc(data, opts)
    await setDoc(ref, stamped as any)
  }

  return { createDocument, setDocument }
}
