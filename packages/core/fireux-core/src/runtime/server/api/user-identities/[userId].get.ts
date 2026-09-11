import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { createError, setResponseHeaders, type H3Event } from 'h3'
import { getRuntimeIdentityFirestore } from '../../utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../utils/ids/path'
import type { DetailResponse } from '../../../models/utils/directory'
import type { UserIdentitySummary } from '../../../user/models/user-directory.model.ts'
import { readUserIdentitySummary } from '../../../user/server/identity/summary'

const CACHE_CONTROL =
  'public, max-age=120, s-maxage=600, stale-while-revalidate=3600'

export default defineLiveReadHandler(async (event: H3Event) => {
  const userId = requireFirestoreDocumentId(
    event.context.params?.userId,
    'User id'
  )
  if (userId.length > 128) {
    throw createError({ statusCode: 400, statusMessage: 'User id is invalid.' })
  }

  const snapshot = await getRuntimeIdentityFirestore()
    .collection('users')
    .doc(userId)
    .get()
  const item = readUserIdentitySummary(snapshot)
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': CACHE_CONTROL,
  })

  const response: DetailResponse<UserIdentitySummary> = {
    ok: true,
    generatedAt: new Date().toISOString(),
    item,
  }
  return response
})
