import { createError, defineEventHandler } from 'h3'
import { uploadProtectedImage } from 'fireux-core/runtime/server/utils/uploads/image'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  runtimeDatabases,
  assertActiveProfessional,
} from '../../../../../user/server/professional/structured'

export default defineEventHandler((event) =>
  uploadProtectedImage(event, async (path) => {
    const { uid } = await requireFirebaseBearerUser(event)
    if (path !== `professionals/${uid}/image/current`)
      throw createError({
        statusCode: 403,
        statusMessage: 'Upload only your own Professional image.',
      })
    const { appId, appDb } = runtimeDatabases(event)
    assertActiveProfessional(
      await appDb.getAll(
        appDb.doc(`apps/${appId}`),
        appDb.doc(`apps/${appId}/users/${uid}`)
      )
    )
  })
)
