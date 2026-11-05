import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { normalizeBusiness } from '../../utils/normalize-business'
import type { BusinessDirectoryPage } from '../../models/business-collection.model'
export async function readBusinessDirectoryPage(input: { limit?: unknown; cursor?: unknown }): Promise<BusinessDirectoryPage> {
  const limit = Math.min(50, Math.max(1, Number(input.limit) || 24))
  const cursor = String(input.cursor || '')
  if (cursor && !isFirestoreDocumentId(cursor)) throw createError({ statusCode: 400, statusMessage: 'Invalid Business cursor.' })
  let query = getRuntimeFirestore().collection('businesses').orderBy(FieldPath.documentId()).limit(limit + 1)
  if (cursor) query = query.startAfter(cursor)
  const result = await query.get()
  const docs = result.docs.slice(0, limit)
  return { businesses: docs.flatMap((doc) => { const item = normalizeBusiness(doc.id, doc.data()); return item ? [item] : [] }), places: [], ...(result.docs.length > limit ? { nextCursor: docs.at(-1)!.id } : {}) }
}
