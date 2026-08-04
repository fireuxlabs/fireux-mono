// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: expose one exact allowlisted public User identity.
import {
  createError,
  defineEventHandler,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { UserStorage } from '../../../../models/core/user.model'
import { getRuntimeIdentityFirestore } from '../../../utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../utils/ids/path'
import type {
  PublicDetailResponse,
  PublicUserIdentityDto,
} from '../../../utils/public-projection/public-dto.types'
import { mapPublicUserIdentity } from '../../../utils/public-projection/public-user-identity'

const CACHE_CONTROL =
  'public, max-age=120, s-maxage=600, stale-while-revalidate=3600'

export default defineEventHandler(async (event: H3Event) => {
  const userId = requireFirestoreDocumentId(
    event.context.params?.userId,
    'User id'
  )
  if (userId.length > 128) {
    throw createError({ statusCode: 400, statusMessage: 'User id is invalid.' })
  }

  const snapshot = await getRuntimeIdentityFirestore()
    .collection(UserStorage.collection)
    .doc(userId)
    .get()
  const item = mapPublicUserIdentity(snapshot)
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': CACHE_CONTROL,
  })

  const response: PublicDetailResponse<PublicUserIdentityDto> = {
    ok: true,
    generatedAt: new Date().toISOString(),
    item,
  }
  return response
})
