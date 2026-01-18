import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useRequireUser } from '../../firebase/useRequireUser'

type StampMode = 'none' | 'date' | 'time' | 'pinpoint'
type StampOpts = { raw?: boolean; mode?: StampMode; creator_id?: string | null; requireUser?: boolean }

type Stamped<T> = T & {
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
  creator_id?: string
}

export async function stampDoc<T>(data: T, opts: StampOpts = {}): Promise<T | Stamped<T>> {
  // honor explicit raw or explicit 'none' mode
  if (opts.raw || opts.mode === 'none') return data

  const requireUser = opts.requireUser !== false
  let creatorId = typeof opts.creator_id === 'string' ? opts.creator_id.trim() : ''

  if (!creatorId && requireUser) {
    const user = await useRequireUser()
    creatorId = user.uid
  }

  const base: any = {
    ...(data as any),
    // canonical server timestamps (authoritative)
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }

  if (creatorId) base.creator_id = creatorId

  // Maintain legacy `created_by` for backward compatibility when callers
  // haven't explicitly provided it. Do not overwrite an explicit value.
  if (creatorId && !(data as any).hasOwnProperty('created_by')) {
    base.created_by = creatorId
  }

  return base as Stamped<T>
}

export function useFirestoreCreate() {
  const db = useFirestore()

  async function createDocument<T>(collectionPath: string, data: T, opts: StampOpts = {}): Promise<void> {
    const ref = collection(db, collectionPath)
    const stamped = await stampDoc(data, opts)
    await addDoc(ref, stamped as any)
  }

  async function setDocument<T>(collectionPath: string, id: string, data: T, opts: StampOpts = {}): Promise<void> {
    const ref = doc(db, collectionPath, id)
    const stamped = await stampDoc(data, opts)
    await setDoc(ref, stamped as any)
  }

  return { createDocument, setDocument }
}
