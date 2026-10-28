import {
  defineEventHandler,
  setResponseHeader,
  createError,
  setResponseHeaders,
  type H3Event,
} from 'h3'

import { getRuntimeIdentityFirestore } from '../../utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../utils/ids/path'
import type { DetailResponse } from '../../../models/utils/directory'
import type { UserIdentitySummary } from '../../../user/models/user-directory.model.ts'
import { readUserIdentitySummary } from '../../../user/server/identity/summary'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

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
    'Cache-Control': 'no-store',
  })

  const response: DetailResponse<UserIdentitySummary> = {
    ok: true,
    generatedAt: new Date().toISOString(),
    item,
  }
  return response
})
