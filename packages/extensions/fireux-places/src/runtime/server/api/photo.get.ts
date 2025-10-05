import {
  defineEventHandler,
  getQuery,
  sendRedirect,
  setHeader,
  setResponseStatus,
} from 'h3'
import { resolvePlacesApiKey } from '../utils/places-api-key'

export default defineEventHandler(async (event: any) => {
  const queryParams = getQuery(event)
  const ref =
    (queryParams.ref as string | undefined) ||
    (queryParams.photo_reference as string | undefined)
  if (!ref) {
    setResponseStatus(event, 400)
    return { error: 'missing-photo-reference' }
  }

  const key = resolvePlacesApiKey(event)
  if (!key) {
    setResponseStatus(event, 500)
    return { error: 'missing-api-key' }
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/photo')
  url.searchParams.set('photo_reference', ref)
  url.searchParams.set('key', key)

  const maxWidth =
    (queryParams.maxwidth as string | undefined) ||
    (queryParams.maxWidth as string | undefined)
  const maxHeight =
    (queryParams.maxheight as string | undefined) ||
    (queryParams.maxHeight as string | undefined)

  if (maxWidth) {
    url.searchParams.set('maxwidth', maxWidth)
  } else if (maxHeight) {
    url.searchParams.set('maxheight', maxHeight)
  } else {
    url.searchParams.set('maxwidth', '400')
  }

  try {
    const res = await fetch(url.toString(), {
      redirect: 'manual',
    })

    // Google Photo API usually responds with a 302 redirect to the actual asset.
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (location) {
        setHeader(event, 'cache-control', 'public, max-age=86400')
        return sendRedirect(event, location, res.status)
      }
    }

    if (res.ok) {
      const contentType = res.headers.get('content-type') || 'image/jpeg'
      setHeader(event, 'cache-control', 'public, max-age=86400')
      setHeader(event, 'content-type', contentType)
      const arrayBuffer = await res.arrayBuffer()
      return new Uint8Array(arrayBuffer)
    }

    setResponseStatus(event, res.status)
    return { error: 'photo-fetch-failed', status: res.status }
  } catch (error: any) {
    setResponseStatus(event, 502)
    return { error: 'photo-fetch-error', message: error?.message }
  }
})
