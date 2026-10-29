import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeader,
} from 'h3'
import { getRuntimeIdentityFirestore } from '../../utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../utils/ids/path'
import { readUserIdentitySummary } from '../../../user/server/identity/summary'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const value = getQuery(event).ids
  const ids = [
    ...new Set(
      (Array.isArray(value) ? value : [value])
        .filter(Boolean)
        .map((value) => requireFirestoreDocumentId(value, 'User id'))
    ),
  ]
  if (ids.length > 100 || ids.some((id) => id.length > 128))
    throw createError({
      statusCode: 400,
      statusMessage: 'Request at most 100 valid User identities.',
    })
  if (!ids.length) return []
  const db = getRuntimeIdentityFirestore()
  const snapshots = await db.getAll(
    ...ids.map((id) => db.collection('users').doc(id))
  )
  return snapshots.flatMap((snapshot) => {
    const summary = readUserIdentitySummary(snapshot)
    return summary ? [summary] : []
  })
})
