import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../app/FireUXConfig'
import { useRequireUser } from '../../firebase/useRequireUser'

type StampOpts = {
  stamp?: boolean
  creator?: boolean
  app?: boolean
}

type Stamped<T> = T & {
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
  creator_id?: string
}

export async function stampDoc<T>(data: T, opts: StampOpts = {}): Promise<T | Stamped<T>> {
  if (opts.stamp === false) return data

  const base: any = {
    ...(data as any),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }

  if (opts.app) {
    const fireux = useFireUXConfig()
    base.app_id = fireux.appId
  }

  if (opts.creator) {
    const user = await useRequireUser()
    base.creator_id = user.uid
  }

  return base as Stamped<T>
}

export function useFirestoreCreate() {
  const db = useFirestore()

  async function createDocument<T>(collectionPath: string, data: T, opts: StampOpts = {}): Promise<string> {
    const ref = collection(db, collectionPath)
    const stamped = await stampDoc(data, opts)
    const docRef = await addDoc(ref, stamped as any)
    return docRef.id
  }

  async function setDocument<T>(collectionPath: string, id: string, data: T, opts: StampOpts = {}): Promise<void> {
    const ref = doc(db, collectionPath, id)
    const stamped = await stampDoc(data, opts)
    await setDoc(ref, stamped as any)
  }

  return { createDocument, setDocument }
}
