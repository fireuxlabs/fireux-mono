import { FieldPath } from 'firebase-admin/firestore'
import { fail, requestId } from '../../menu-express/contract'
import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { operator } from '../../menu-express/authority'
import { dto } from '../../menu-express/contract'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const { target } = await operator(event)
  const cursor = getQuery(event).after
  let query = getRuntimeFirestore()
    .collection(target.collectionPath)
    .orderBy('createdAt', 'desc')
    .orderBy(FieldPath.documentId(), 'desc')
    .limit(31)
  if (typeof cursor === 'string') {
    const [createdAt, id] = cursor.split('|')
    if (!createdAt || !Number.isFinite(Date.parse(createdAt)))
      fail('Invalid queue cursor.')
    query = query.startAfter(createdAt, requestId(id))
  }
  const records = await query.get()
  const items = records.docs.slice(0, 30).map((doc) => dto(doc.id, doc.data()))
  return {
    items,
    hasMore: records.size > 30,
    after: items.length ? `${items.at(-1)!.createdAt}|${items.at(-1)!.id}` : '',
  }
})
