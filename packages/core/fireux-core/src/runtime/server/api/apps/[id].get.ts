import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { AppStorage } from '../../../app/models/app.model.ts'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { getRuntimeFirestore } from '../../utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../utils/ids/path'
import { projectAppDetail } from '../../../app/server/index/projection.ts'
import { asTrimmedString } from '../../utils/projection/normalize'
import type { DetailResponse } from '../../../models/utils/directory'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    // Detail consumers can turn the App website into durable links.
    // Revalidate every lookup so a changed doorway is never served stale.
    'Cache-Control': 'no-store',
  })

  const appId = requireFirestoreDocumentId(
    getRouterParam(event, 'id'),
    'App id'
  )

  const collection = getRuntimeFirestore().collection(AppStorage.collection)
  const doc = await collection.doc(appId).get()

  const raw = doc?.exists
    ? ((doc.data() || {}) as Record<string, unknown>)
    : null
  const isActive = asTrimmedString(raw?.status) === 'active'
  const config = useFireUXConfig()
  const ecosystemId = asTrimmedString(config.ecosystemId)
  const belongsToOwner = ecosystemId
    ? asTrimmedString(raw?.ecosystem_id) === ecosystemId
    : doc?.id === config.appId

  if (!raw || !isActive || !belongsToOwner) {
    throw createError({
      statusCode: 404,
      statusMessage: 'App not found',
    })
  }

  const app = projectAppDetail(raw, { id: doc!.id })
  if (!app) {
    throw createError({
      statusCode: 404,
      statusMessage: 'App not found',
    })
  }

  const response: DetailResponse<typeof app> = {
    ok: true,
    generatedAt: new Date().toISOString(),
    item: app,
  }

  return response
})
