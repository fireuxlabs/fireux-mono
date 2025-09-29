import {
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  createError,
  send,
} from 'h3'

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)

  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid URL parameter',
    })
  }

  // Basic safety: only http(s) URLs
  if (!/^https?:\/\//i.test(url)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid protocol, must be http/https',
    })
  }

  try {
    const t0 = Date.now()
    const response = await fetch(url, { redirect: 'follow' })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch image: ${response.statusText}`,
      })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const contentLength =
      response.headers.get('content-length') || `${imageBuffer.byteLength}`

    // Dev-time observability
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy/image] upstream', {
        url,
        status: response.status,
        ok: response.ok,
        contentType,
        contentLength,
        ms: Date.now() - t0,
      })
    }

    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    })

    return send(event, Buffer.from(imageBuffer))
  } catch (error: any) {
    console.error('[proxy/image] error:', error?.message || error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Image proxy failed',
    })
  }
})
