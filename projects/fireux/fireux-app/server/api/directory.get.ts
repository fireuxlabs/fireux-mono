import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
// Concurrent edit — 2026-07-20 16:00 CEST — FireUX dev recovery: resolve cross-package server imports explicitly.
import { createError, setResponseHeaders, type H3Event } from 'h3'
import { readPlatformDirectory } from '../utils/default-directory'

export default defineLiveReadHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control':
      'public, max-age=120, s-maxage=600, stale-while-revalidate=3600',
  })

  try {
    return await readPlatformDirectory()
  } catch (error) {
    console.error('[platform-directory] Read failed.', error)
    throw createError({
      statusCode: 503,
      statusMessage: 'Platform directory is temporarily unavailable.',
    })
  }
})
