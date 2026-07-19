import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { AppStorage } from '../../../../models/core/app.model'
import { getRuntimeFirestore } from '../../../utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../utils/ids/path'
import { projectPublicApp } from '../../../utils/public-projection/public-app.dto'
import { asTrimmedString } from '../../../utils/public-projection/public-dto.helpers'
import type { PublicDetailResponse } from '../../../utils/public-projection/public-dto.types'

const CACHE_CONTROL =
  'public, max-age=120, s-maxage=600, stale-while-revalidate=3600'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': CACHE_CONTROL,
  })

  const appId = requireFirestoreDocumentId(
    getRouterParam(event, 'id'),
    'App id'
  )

  const collection = getRuntimeFirestore().collection(AppStorage.collection)
  const directDoc = await collection.doc(appId).get()
  const slugMatch = directDoc.exists
    ? null
    : await collection.where('slug', '==', appId).limit(1).get()
  const doc = directDoc.exists ? directDoc : slugMatch?.docs[0]

  const raw = doc?.exists
    ? ((doc.data() || {}) as Record<string, unknown>)
    : null
  const isPublic = asTrimmedString(raw?.status) === 'active'

  if (!raw || !isPublic) {
    throw createError({
      statusCode: 404,
      statusMessage: 'App not found',
    })
  }

  const app = projectPublicApp(raw, { id: doc.id })
  if (!app) {
    throw createError({
      statusCode: 404,
      statusMessage: 'App not found',
    })
  }

  const response: PublicDetailResponse<typeof app> = {
    ok: true,
    generatedAt: new Date().toISOString(),
    item: app,
  }

  return response
})
