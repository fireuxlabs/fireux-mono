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
  created: {
    at: ReturnType<typeof serverTimestamp>
    by?: string
    app_id?: string
  }
  updated: {
    at: ReturnType<typeof serverTimestamp>
    by?: string
  }
}

export async function stampDoc<T>(data: T, opts: StampOpts = {}): Promise<T | Stamped<T>> {
  if (opts.stamp === false) return data

  const base: any = {
    ...(data as any),
    created: {
      at: serverTimestamp(),
    },
    updated: {
      at: serverTimestamp(),
    },
  }

  if (opts.app) {
    const fireux = useFireUXConfig()
    base.created.app_id = fireux.appId
  }

  if (opts.creator) {
    const user = await useRequireUser()
    base.created.by = user.uid
    base.updated.by = user.uid
  }

  return base as Stamped<T>
}

export function useFirestoreCreate() {
  const db = useFirestore()

  async function createDocument<T>(collectionPath: string, data: T, opts: StampOpts = {}): Promise<string> {
    const ref = collection(db, collectionPath)
    const next = { ...(data as any) } as Record<string, unknown>
    if ('id' in next) delete next.id
    const stamped = await stampDoc(next as T, opts)
    const docRef = await addDoc(ref, stamped as any)
    return docRef.id
  }

  async function setDocument<T>(collectionPath: string, id: string, data: T, opts: StampOpts = {}): Promise<void> {
    const ref = doc(db, collectionPath, id)
    // Canon: never persist id field; Firestore doc id is source of truth.
    const next = { ...(data as any) } as Record<string, unknown>
    if ('id' in next) delete next.id
    const stamped = await stampDoc(next as T, opts)
    await setDoc(ref, stamped as any)
  }

  return { createDocument, setDocument }
}
