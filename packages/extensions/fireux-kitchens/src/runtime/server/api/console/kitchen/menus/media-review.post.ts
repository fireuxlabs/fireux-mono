import { createError, defineEventHandler, readBody, type H3Event } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { normalizeMenuMediaReview } from '../../../../menu/media/review'
import {
  assertKitchenMenuUploadAccess,
  kitchenMenuUploadPath,
  requireKitchenMenuUploadUser,
} from '../../../../menu/source/uploads'

export default defineEventHandler(async (event: H3Event) => {
  const uid = await requireKitchenMenuUploadUser(
    event,
    'Sign in before reviewing menu media.'
  )
  const body = (await readBody(event)) as Record<string, unknown> | null
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const uploadId = requirePathSegment(body?.uploadId, 'Upload id')
  const decisions = normalizeMenuMediaReview(body?.decisions)
  await assertKitchenMenuUploadAccess(appId, kitchenId, uid)

  const ref = getRuntimeFirestore().doc(
    kitchenMenuUploadPath(appId, kitchenId, uploadId)
  )
  const snapshot = await ref.get()
  if (!snapshot.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu upload not found.',
    })
  }
  const stamp = serverAuditStamp({ by: uid, appId })
  await ref.set(
    {
      ai_draft: { media_review: decisions, updated: stamp },
      updated: stamp,
    },
    { merge: true }
  )

  return { ok: true as const, decisions, message: 'Media review saved.' }
})
