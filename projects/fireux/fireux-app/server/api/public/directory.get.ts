// Concurrent edit — 2026-07-20 16:00 CEST — FireUX dev recovery: resolve cross-package server imports explicitly.
import {
  createError,
  defineEventHandler,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { readPlatformDirectory } from '../../utils/platform-directory'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control':
      'public, max-age=120, s-maxage=600, stale-while-revalidate=3600',
  })

  try {
    return await readPlatformDirectory()
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'Platform directory is temporarily unavailable.',
    })
  }
})
