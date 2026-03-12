import { getRuntimeFirestore } from '../getRuntimeFirestore'

export type PublicCollectionQueryOptions = {
  where?: Array<{
    field: string
    op?: FirebaseFirestore.WhereFilterOp
    value: unknown
  }>
  orderByField?: string
  orderDirection?: FirebaseFirestore.OrderByDirection
  limit?: number
  offset?: number
}

function normalizeCollectionPath(input: string): string {
  return String(input || '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
}

function normalizeLimit(input: unknown): number {
  const value = Number(input)
  if (!Number.isFinite(value)) return 100
  return Math.max(1, Math.min(5000, Math.trunc(value)))
}

function normalizeOffset(input: unknown): number {
  const value = Number(input)
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.trunc(value))
}

export function getPublicFirestore() {
  return getRuntimeFirestore()
}

export async function readPublicDocById(
  collectionPath: string,
  id: string
): Promise<FirebaseFirestore.QueryDocumentSnapshot | null> {
  const path = normalizeCollectionPath(collectionPath)
  const docId = String(id || '').trim()
  if (!path || !docId) return null

  const snap = await getPublicFirestore().collection(path).doc(docId).get()
  return snap.exists ? (snap as FirebaseFirestore.QueryDocumentSnapshot) : null
}

export async function readFirstPublicDocByField(
  collectionPath: string,
  field: string,
  value: unknown
): Promise<FirebaseFirestore.QueryDocumentSnapshot | null> {
  const path = normalizeCollectionPath(collectionPath)
  const key = String(field || '').trim()
  if (!path || !key) return null

  const snap = await getPublicFirestore()
    .collection(path)
    .where(key, '==', value)
    .limit(1)
    .get()

  return snap.docs[0] || null
}

export async function readPublicCollectionPage(
  collectionPath: string,
  options: PublicCollectionQueryOptions = {}
): Promise<FirebaseFirestore.QueryDocumentSnapshot[]> {
  const path = normalizeCollectionPath(collectionPath)
  if (!path) return []

  let query: FirebaseFirestore.Query = getPublicFirestore().collection(path)

  for (const clause of options.where || []) {
    const field = String(clause?.field || '').trim()
    if (!field) continue
    const op = clause.op || '=='
    query = query.where(field, op, clause.value)
  }

  if (options.orderByField) {
    query = query.orderBy(
      options.orderByField,
      options.orderDirection || 'asc'
    )
  }

  const offset = normalizeOffset(options.offset)
  if (offset > 0) query = query.offset(offset)

  query = query.limit(normalizeLimit(options.limit))
  const snap = await query.get()
  return snap.docs
}
