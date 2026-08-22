import { createError, defineEventHandler, getRouterParam, setResponseHeaders, type H3Event } from 'h3'
import type { DetailResponse } from 'fireux-core/runtime/models/utils/directory'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import { readPlatformApp } from '../../../utils/apps'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  const app = await readPlatformApp(String(getRouterParam(event, 'id') || ''))
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })
  return { ok: true, generatedAt: new Date().toISOString(), item: app } satisfies DetailResponse<App>
})
