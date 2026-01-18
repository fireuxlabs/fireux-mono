import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useRequireUser } from '../../firebase/useRequireUser'

type StampMode = 'none' | 'date' | 'time' | 'pinpoint'
type StampOpts = { raw?: boolean; mode?: StampMode }

type Stamped<T> = T & {
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
  creator_id: string
  // opt-in client-side fields for higher-accuracy modes
  created_at_client?: number
  created_at_precise?: { ms: number; hr?: number | null }
  stamp_mode?: StampMode
}

export async function stampDoc<T>(data: T, opts: StampOpts = {}): Promise<T | Stamped<T>> {
  // honor explicit raw or explicit 'none' mode
  if (opts.raw || opts.mode === 'none') return data

  const user = await useRequireUser()
  const mode: StampMode = opts.mode ?? 'date'

  const base: any = {
    ...(data as any),
    // canonical server timestamps (authoritative)
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    creator_id: user.uid,
  }

  // Maintain legacy `created_by` for backward compatibility when callers
  // haven't explicitly provided it. Do not overwrite an explicit value.
  if (!(data as any).hasOwnProperty('created_by')) {
    base.created_by = user.uid
  }

  // Only set stamp_mode when non-default to avoid storing for the common case
  if (mode !== 'date') base.stamp_mode = mode

  // 'time' and 'pinpoint' include client-side high-res timing (opt-in)
  if (mode === 'time' || mode === 'pinpoint') {
    const nowMs = Date.now()
    const perf = (globalThis as any)?.performance
    const hr = typeof perf?.now === 'function' ? perf.now() : null
    base.created_at_client = nowMs
    base.created_at_precise = { ms: nowMs, hr }
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
