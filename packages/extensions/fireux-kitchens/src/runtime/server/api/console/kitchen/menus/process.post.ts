import { createError, defineEventHandler, readBody, type H3Event } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { processKitchenMenuAiReview } from '../../../../../menu/server/ai/review'
import {
  assertKitchenMenuCurrencyCode,
  assertKitchenMenuUploadAccess,
  requireKitchenMenuUploadUser,
} from '../../../../../menu/server/source/uploads'

type ProcessMenuBody = Partial<
  Record<'appId' | 'kitchenId' | 'menuId' | 'uploadId' | 'quality', string>
> & {
  limit?: number
  force?: boolean
  confirmBilling?: boolean
}

export default defineEventHandler(async (event: H3Event) => {
  const uid = await requireKitchenMenuUploadUser(
    event,
    'Sign in before processing a menu source.'
  )
  const body = (await readBody(event)) as ProcessMenuBody | null
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const menuId = requirePathSegment(body?.menuId, 'Menu id')
  const uploadId = requirePathSegment(body?.uploadId || menuId, 'Upload id')

  await assertKitchenMenuUploadAccess(appId, kitchenId, uid)
  const currencyCode = await assertKitchenMenuCurrencyCode(appId, kitchenId)

  if (!body?.confirmBilling) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Confirm kitchen AI billing before processing this menu.',
    })
  }

  return processKitchenMenuAiReview({
    event,
    appId,
    kitchenId,
    menuId,
    uploadId,
    uid,
    currencyCode,
    quality: body.quality,
    limit: body.limit,
    force: body.force,
  })
})
