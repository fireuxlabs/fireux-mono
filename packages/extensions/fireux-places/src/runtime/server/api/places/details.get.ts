import { useRuntimeConfig } from '#imports'
import {
  defineEventHandler,
  getQuery,
  getRequestHeader,
  getRequestIP,
  setResponseStatus,
} from 'h3'
import { resolvePlacesApiKey } from '../../utils/places-api-key'

export default defineEventHandler(async (event: any) => {
  const dev = import.meta.dev
  const reqId = Math.random().toString(36).slice(2, 8)
  const runtimeConfig = useRuntimeConfig(event) as any
  const debug =
    dev &&
    (
      process.env.FIREUX_PLACES_DEBUG === 'true' ||
      Boolean((runtimeConfig?.public as any)?.fireux?.places?.debug)
    )
  const queryParams = getQuery(event)
  const placeId = queryParams.place_id as string | undefined
  if (!placeId) {
    if (debug) {
      console.warn('[places][details]', { reqId, stage: 'missing_place_id' })
    }
    return { result: null, error: 'missing_place_id' }
  }

  if (debug) {
    console.info('[places][details]', { reqId, stage: 'request', placeId })
  }

  const ip =
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestIP(event) ||
    'anon'
  const host =
    getRequestHeader(event, 'x-forwarded-host') ||
    getRequestHeader(event, 'host') ||
    null

  const key = resolvePlacesApiKey(event)
  if (!key) {
    const envs = {
      GOOGLE_PLACES_API_KEY: !!process.env.GOOGLE_PLACES_API_KEY,
      NUXT_GOOGLE_PLACES_API_KEY: !!process.env.NUXT_GOOGLE_PLACES_API_KEY,
      NUXT_PUBLIC_GOOGLE_PLACES_API_KEY:
        !!process.env.NUXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    }
    const rcFlags = {
      runtime_googlePlacesApiKey: !!runtimeConfig?.googlePlacesApiKey,
      runtime_fireux_googlePlacesApiKey:
        !!runtimeConfig?.fireux?.googlePlacesApiKey,
      public_googlePlacesApiKey: !!runtimeConfig?.public?.googlePlacesApiKey,
      public_fireux_googlePlacesApiKey:
        !!runtimeConfig?.public?.fireux?.googlePlacesApiKey,
    }
    console.error('[places][details]', {
      reqId,
      stage: 'missing_api_key',
      placeId,
      ip,
      host,
      envs,
      runtimeConfig: rcFlags,
    })
    setResponseStatus(event, 500)
    return { result: null, error: 'missing_api_key' }
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set(
    'fields',
    [
      'address_component',
      'business_status',
      'formatted_address',
      'formatted_phone_number',
      'geometry',
      'international_phone_number',
      'name',
      'opening_hours',
      'place_id',
      'price_level',
      'secondary_opening_hours',
      'type',
      'url',
      'utc_offset',
      'vicinity',
      'website',
    ].join(',')
  )
  url.searchParams.set('key', key)

  try {
    const safeUrl = new URL(url.toString())
    safeUrl.searchParams.set('key', '[redacted]')

    const start = Date.now()
    const res = await fetch(url.toString())
    const data = await res.json()

    if (debug) {
      console.info('[places][details]', {
        reqId,
        stage: 'upstream_response',
        httpStatus: res.status,
        upstreamStatus: data?.status ?? null,
        timeMs: Date.now() - start,
        url: safeUrl.toString(),
      })
    }
    const upstreamStatus = String(data?.status || '')
    const isNoResultStatus =
      upstreamStatus === 'ZERO_RESULTS' || upstreamStatus === 'NOT_FOUND'

    if (isNoResultStatus) {
      if (debug) {
        console.info('[places][details]', {
          reqId,
          stage: 'no_result',
          placeId,
          upstreamStatus,
        })
      }
      return { result: null }
    }

    if (upstreamStatus !== 'OK') {
      console.warn('[places][details]', {
        reqId,
        stage: 'upstream_not_ok',
        placeId,
        upstreamStatus: data?.status ?? null,
        errorMessage: data?.error_message ?? null,
      })
      return {
        result: null,
        error: 'upstream_not_ok',
        upstreamStatus: import.meta.dev ? (data.status ?? null) : null,
      }
    }

    if (debug) {
      console.info('[places][details]', { reqId, stage: 'ok', placeId })
    }
    return { result: data.result }
  } catch (error) {
    if (debug) {
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
