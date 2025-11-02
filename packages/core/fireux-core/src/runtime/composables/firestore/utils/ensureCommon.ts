import {
  doc,
  getDoc,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'

import { useFirestoreManager } from '../operations/useFirestoreManager.ts'
import type { AppUser } from 'fireux-core/runtime/models/core/user.model.ts'

type EnsureDocResult = {
  created: boolean
  snapshot?: DocumentSnapshot<DocumentData>
}

function toCollectionPath(path: string | string[]): string {
  return Array.isArray(path) ? path.join('/') : path
}

export async function ensureDoc<T extends DocumentData>(
  path: string | string[],
  id: string,
  data: T,
  opts?: { raw?: boolean }
): Promise<EnsureDocResult> {
  const db = useFirestore()
  const collectionPath = toCollectionPath(path)
  if (!collectionPath) throw new Error('[ensureDoc] collection path missing')
  const ref = doc(db, collectionPath, id)
  const snapshot = await getDoc(ref)

  if (snapshot.exists()) {
    return { created: false, snapshot }
  }

  const { setDocument } = useFirestoreManager()
  await setDocument(collectionPath, id, data, opts)
  return { created: true }
}

export async function ensureAppMembership(
  appId: string | null | undefined,
  uid: string,
  membershipRole: 'admin' | 'user' = 'user'
) {
  if (!appId) return { created: false }

  const payload: AppUser = {
    id: uid,
    role: membershipRole,
    creator_id: uid,
  } as AppUser

  return ensureDoc<AppUser>(['apps', appId, 'users'], uid, payload)
}

export function makeHandle(displayName: string, uid: string) {
  const base = displayName.toLowerCase().replaceAll(/[^a-z0-9]/g, '')
  const padded = base || 'user'
  return `${padded}${uid.slice(0, 4)}`.slice(0, 12)
}
