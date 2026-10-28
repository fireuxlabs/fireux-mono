import {
  defineEventHandler,
  setResponseHeader,
  createError,
  setResponseHeaders,
  type H3Event,
} from 'h3'

// Concurrent edit — 2026-07-20 16:00 CEST — FireUX dev recovery: resolve cross-package server imports explicitly.

import { readPlatformDirectory } from '../utils/default-directory'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
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
