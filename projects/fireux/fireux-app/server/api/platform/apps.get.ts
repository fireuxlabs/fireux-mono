import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import type { CollectionResponse } from 'fireux-core/runtime/models/utils/directory'
import { readPlatformApps } from '../../utils/apps'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  const items = await readPlatformApps()
  const response: CollectionResponse<App> = {
    ok: true,
    count: items.length,
    generatedAt: new Date().toISOString(),
    items,
  }
  return response
})
