import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'

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
  const user = useCurrentUser().value
  if (!user?.uid) throw new Error('User is not authenticated.')

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
    path: string,
    data: T,
    opts?: { raw?: boolean }
  ): Promise<void> {
    const ref = collection(db, path)
    const stamped = await stampDoc(data, opts)
    await addDoc(ref, stamped as any)
  }

  async function setDocument<T>(
    path: string,
    id: string,
    data: T,
    opts?: { raw?: boolean }
  ): Promise<void> {
    const ref = doc(db, path, id)
    const stamped = await stampDoc(data, opts)
    await setDoc(ref, stamped as any)
  }

  return { createDocument, setDocument }
}
