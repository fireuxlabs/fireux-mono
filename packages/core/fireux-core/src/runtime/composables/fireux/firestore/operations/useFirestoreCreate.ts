import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { useFirestoreResolver } from '../vuefire'
import { useFireUXConfig } from '../../app/FireUXConfig'
import { useRequireUser } from '../../firebase/useRequireUser'
import type { Ref } from 'vue'

type UseFirestoreCreateOptions = {
  databaseId?: string | Ref<string | null | undefined> | null | undefined
}

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

export function useFirestoreCreate(options: UseFirestoreCreateOptions = {}) {
  const resolveDb = useFirestoreResolver(options.databaseId)

  // Generated-id create. Entity create seams decide whether this is plain create, ensure, or provision.
  async function createDocument<T>(collectionPath: string, data: T, opts: StampOpts = {}): Promise<string> {
    const ref = collection(resolveDb(), collectionPath)
    const next = { ...(data as any) } as Record<string, unknown>
    if ('id' in next) delete next.id
    const stamped = await stampDoc(next as T, opts)
    const docRef = await addDoc(ref, stamped as any)
    return docRef.id
  }

  // Known-id create. Entity create seams own slug/id validation before calling this primitive.
  async function createDocumentWithId<T>(
    collectionPath: string,
    id: string,
    data: T,
    opts: StampOpts = {}
  ): Promise<string> {
    const ref = doc(resolveDb(), collectionPath, id)
    const existing = await getDoc(ref)
    if (existing.exists()) {
      throw new Error(`Document already exists: ${id}`)
    }

    // Canon: never persist id field; Firestore doc id is source of truth.
    const next = { ...(data as any) } as Record<string, unknown>
    if ('id' in next) delete next.id
    const stamped = await stampDoc(next as T, opts)
    await setDoc(ref, stamped as any)
    return id
  }

  // Known-id upsert. Use only when replacement is intended.
  async function setDocument<T>(collectionPath: string, id: string, data: T, opts: StampOpts = {}): Promise<void> {
    const ref = doc(resolveDb(), collectionPath, id)
    // Canon: never persist id field; Firestore doc id is source of truth.
    const next = { ...(data as any) } as Record<string, unknown>
    if ('id' in next) delete next.id
    const stamped = await stampDoc(next as T, opts)
    await setDoc(ref, stamped as any)
  }

  return { createDocument, createDocumentWithId, setDocument }
}
