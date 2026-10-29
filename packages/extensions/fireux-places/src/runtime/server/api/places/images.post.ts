import { createError, defineEventHandler } from 'h3'
import { uploadProtectedImage } from 'fireux-core/runtime/server/utils/uploads/image'
import { multipartField } from 'fireux-core/runtime/server/utils/uploads/multipart'
import { withPlaceWriter } from '../../../place/server/identity/update'
import {
  context,
  canConfigure,
} from '../../../place/server/index/onboarding/context'

export default defineEventHandler((event) =>
  uploadProtectedImage(event, async (path, parts) => {
    const match =
      /^places\/([^/]+)\/(?:image|cover|logo|wordmark|avatar)(?:\/revisions\/[a-zA-Z0-9-]+)?$|^places\/([^/]+)\/gallery\/[a-zA-Z0-9-]+$/.exec(
        path
      )
    const id = match?.[1] || match?.[2]
    if (!id)
      throw createError({
        statusCode: 400,
        statusMessage: 'Place image target is invalid.',
      })
    if (multipartField(parts, 'mode') === 'onboarding') {
      if (!['avatar', 'cover'].includes(path.split('/')[2] || ''))
        throw createError({
          statusCode: 400,
          statusMessage: 'Onboarding image target is invalid.',
        })
      const actor = await context(event, id)
      const place = await actor.placeRef.get()
      if (!place.exists || !canConfigure(place.data() || {}, actor))
        throw createError({
          statusCode: 403,
          statusMessage: 'Place configuration access is required.',
        })
      return
    }
    await withPlaceWriter(
      event,
      id,
      {
        app_id: multipartField(parts, 'app_id'),
        kitchen_id: multipartField(parts, 'kitchen_id'),
      },
      () => undefined
    )
  })
)
