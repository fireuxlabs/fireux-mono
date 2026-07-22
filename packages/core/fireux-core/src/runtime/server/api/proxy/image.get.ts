// Concurrent edit — 2026-07-22 00:33 CEST — Public image fetch seam: delegate proxy transport to the reusable bounded raster fetcher.
import {
  createError,
  defineEventHandler,
  getQuery,
  send,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { fetchPublicRasterImage } from '../../utils/http/public-raster-image'

function isHttpError(error: unknown): error is { statusCode: number } {
  return !!error && typeof error === 'object' && 'statusCode' in error
}

export default defineEventHandler(async (event: H3Event) => {
  const { url } = getQuery(event)

  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid URL parameter',
    })
  }

  try {
    const t0 = Date.now()
    const image = await fetchPublicRasterImage(url)

    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy/image] upstream', {
        url: image.finalUrl,
        status: image.status,
        contentType: image.contentType,
        contentLength: `${image.buffer.byteLength}`,
        ms: Date.now() - t0,
      })
    }

    setResponseHeaders(event, {
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    })

    return send(event, image.buffer)
  } catch (error: unknown) {
    if (isHttpError(error)) throw error

    console.error('[proxy/image] error:', error instanceof Error ? error.message : error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Image proxy failed',
    })
  }
})
