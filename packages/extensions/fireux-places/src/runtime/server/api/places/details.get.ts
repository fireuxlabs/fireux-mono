import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { resolvePlacesApiKey } from '../../utils/places-api-key'

export default defineEventHandler(async (event: any) => {
  const dev = import.meta.dev
  const reqId = Math.random().toString(36).slice(2, 8)
  const queryParams = getQuery(event)
  const placeId = queryParams.place_id as string | undefined
  if (!placeId) {
    if (dev) {
      console.warn('[places][details]', { reqId, stage: 'missing_place_id' })
    }
    return { result: null, error: 'missing_place_id' }
  }

  if (dev) {
    console.info('[places][details]', { reqId, stage: 'request', placeId })
  }

  const key = resolvePlacesApiKey(event)
  if (!key) {
    if (dev) {
      console.error('[places][details]', {
        reqId,
        stage: 'missing_api_key',
        placeId,
      })
    }
    setResponseStatus(event, 500)
    return { result: null, error: 'missing_api_key' }
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('key', key)

  try {
    const safeUrl = new URL(url.toString())
    safeUrl.searchParams.set('key', '[redacted]')

    const start = Date.now()
    const res = await fetch(url.toString())
    const data = await res.json()

    if (dev) {
      console.info('[places][details]', {
        reqId,
        stage: 'upstream_response',
        httpStatus: res.status,
        upstreamStatus: data?.status ?? null,
        timeMs: Date.now() - start,
        url: safeUrl.toString(),
      })
    }
    if (data.status !== 'OK') {
      if (dev) {
        console.warn('[places][details]', {
          reqId,
          stage: 'upstream_not_ok',
          placeId,
          upstreamStatus: data?.status ?? null,
          errorMessage: data?.error_message ?? null,
        })
      }
      return {
        result: null,
        error: 'upstream_not_ok',
        upstreamStatus: import.meta.dev ? (data.status ?? null) : null,
      }
    }

    if (dev) {
      console.info('[places][details]', { reqId, stage: 'ok', placeId })
    }
    return { result: data.result }
  } catch (error) {
    if (dev) {
      console.error('[places][details]', {
        reqId,
        stage: 'upstream_error',
        placeId,
        error: error instanceof Error ? error.message : String(error),
      })
    }
    setResponseStatus(event, 502)
    return { result: null, error: 'upstream_error' }
  }
})
