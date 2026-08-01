// Concurrent edit — 2026-07-20 16:24 CEST — Repo Efficiency Pass 1 of 6: keep public App doorway details current for durable links.

import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { AppStorage } from '../../../../models/core/app.model'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { getRuntimeFirestore } from '../../../utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../utils/ids/path'
import { projectPublicApp } from '../../../utils/public-projection/public-app.dto'
import { asTrimmedString } from '../../../utils/public-projection/public-dto.helpers'
import type { PublicDetailResponse } from '../../../utils/public-projection/public-dto.types'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    // Detail consumers can turn the App website into durable public links.
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
  const isPublic = asTrimmedString(raw?.status) === 'active'
  const config = useFireUXConfig()
  const ecosystemId = asTrimmedString(config.ecosystemId)
  const belongsToOwner = ecosystemId
    ? asTrimmedString(raw?.ecosystem_id) === ecosystemId
    : doc?.id === config.appId

  if (!raw || !isPublic || !belongsToOwner) {
    throw createError({
      statusCode: 404,
      statusMessage: 'App not found',
    })
  }

  const app = projectPublicApp(raw, { id: doc!.id })
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
