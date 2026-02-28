import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

type SeoIndexUpsertInput = {
  path: string
  isPublic?: boolean
  updatedAtField?: string
}

function normalizePath(input: string): string | null {
  let path = String(input || '').trim()
  if (!path) return null

  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname || '/'
    } catch {
      return null
    }
  }

  const queryIdx = path.indexOf('?')
  if (queryIdx >= 0) path = path.slice(0, queryIdx)
  const hashIdx = path.indexOf('#')
  if (hashIdx >= 0) path = path.slice(0, hashIdx)

  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/+$/, '')
  return path || '/'
}

function normalizeCollectionPath(path: string): string {
  return String(path || '').trim().replace(/^\/+|\/+$/g, '')
}

export function useSeoIndexWrite() {
  const db = useFirestore()

  async function upsertSeoIndexDoc(
    indexCollectionPath: string,
    id: string,
    input: SeoIndexUpsertInput
  ): Promise<void> {
    const collectionPath = normalizeCollectionPath(indexCollectionPath)
    const docId = String(id || '').trim()
    const path = normalizePath(input.path)
    if (!collectionPath || !docId || !path) return

    const updatedAtField = String(input.updatedAtField || 'updatedAt').trim() || 'updatedAt'
    const ref = doc(db, collectionPath, docId)

    const payload: Record<string, unknown> = {
      path,
      [updatedAtField]: serverTimestamp(),
    }
    if (typeof input.isPublic === 'boolean') {
      payload.isPublic = input.isPublic
    }

    await setDoc(ref, payload, { merge: true })
  }

  async function markSeoIndexDocPublic(
    indexCollectionPath: string,
    id: string,
    isPublic: boolean,
    updatedAtField = 'updatedAt'
  ): Promise<void> {
    const collectionPath = normalizeCollectionPath(indexCollectionPath)
    const docId = String(id || '').trim()
    if (!collectionPath || !docId) return

    const ref = doc(db, collectionPath, docId)
    await setDoc(
      ref,
      {
        isPublic: Boolean(isPublic),
        [updatedAtField]: serverTimestamp(),
      } as Record<string, unknown>,
      { merge: true }
    )
  }

  async function deleteSeoIndexDoc(indexCollectionPath: string, id: string): Promise<void> {
    const collectionPath = normalizeCollectionPath(indexCollectionPath)
    const docId = String(id || '').trim()
    if (!collectionPath || !docId) return
    await deleteDoc(doc(db, collectionPath, docId))
  }

  return {
    upsertSeoIndexDoc,
    markSeoIndexDocPublic,
    deleteSeoIndexDoc,
  }
}
