import { createError, defineEventHandler } from 'h3'
import { uploadProtectedImage } from 'fireux-core/runtime/server/utils/uploads/image'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { requireProductManager } from '../../../product/server/create/authority'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'

export default defineEventHandler((event) =>
  uploadProtectedImage(event, async (path) => {
    const match = /^products\/([a-z0-9-]+)\/[^/]{1,250}$/.exec(path)
    if (!match)
      throw createError({
        statusCode: 400,
        statusMessage: 'Product image target is invalid.',
      })
    const appId = requireFirestoreDocumentId(
      useFireUXConfig(event).appId,
      'App id'
    )
    const { uid } = await requireFirebaseBearerUser(event)
    const db = getRuntimeFirestore()
    const [app, member, record] = await db.getAll(
      db.doc(`apps/${appId}`),
      db.doc(`apps/${appId}/users/${uid}`),
      db.doc(`products/${match[1]}`)
    )
    if (!app?.exists || !member || !record)
      throw createError({ statusCode: 404, statusMessage: 'App not found.' })
    requireProductManager({ exists: member.exists, data: member.data() })
    if (record.exists && record.data()?.source_app_id !== appId)
      throw createError({
        statusCode: 403,
        statusMessage: 'This Product belongs to another App.',
      })
  })
)
