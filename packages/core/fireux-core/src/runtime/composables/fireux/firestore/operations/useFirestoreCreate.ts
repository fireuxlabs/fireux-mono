import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../app/FireUXConfig'
import { useRequireUser } from '../../firebase/useRequireUser'

type StampOpts = {
  stamp?: boolean
  creator?: boolean
  app?: boolean
  /** When false, skip transitional flat stamp fields (`created_at`, `updated_at`, `creator_id`). */
  legacyFlat?: boolean
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
  // Legacy flat fields kept temporarily while data + readers migrate.
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
  creator_id?: string
  app_id?: string
}

export async function stampDoc<T>(data: T, opts: StampOpts = {}): Promise<T | Stamped<T>> {
  if (opts.stamp === false) return data

  const includeLegacyFlat = opts.legacyFlat !== false

  const base: any = {
    ...(data as any),
    created: {
      at: serverTimestamp(),
    },
    updated: {
      at: serverTimestamp(),
    },
    ...(includeLegacyFlat
      ? {
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }
      : {}),
  }

  if (opts.app) {
    const fireux = useFireUXConfig()
    base.created.app_id = fireux.appId
    base.app_id = fireux.appId
  }

  if (opts.creator) {
    const user = await useRequireUser()
    base.created.by = user.uid
    base.updated.by = user.uid
    if (includeLegacyFlat) {
      base.creator_id = user.uid
    }
  }

  return base as Stamped<T>
}

export function useFirestoreCreate() {
  const db = useFirestore()

  async function createDocument<T>(collectionPath: string, data: T, opts: StampOpts = {}): Promise<string> {
    const ref = collection(db, collectionPath)
    const stamped = await stampDoc(data, opts)
    const docRef = await addDoc(ref, stamped as any)
    await setDoc(docRef, { id: docRef.id } as any, { merge: true })
    return docRef.id
  }

  async function setDocument<T>(collectionPath: string, id: string, data: T, opts: StampOpts = {}): Promise<void> {
    const ref = doc(db, collectionPath, id)
    const stamped = await stampDoc({ ...(data as any), id } as T, opts)
    await setDoc(ref, stamped as any)
  }

  return { createDocument, setDocument }
}
