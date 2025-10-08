import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { resolvePlacesApiKey } from '../../utils/places-api-key'

export default defineEventHandler(async (event: any) => {
  const queryParams = getQuery(event)
  const placeId = queryParams.place_id as string | undefined
  if (!placeId) return { result: null }

  const key = resolvePlacesApiKey(event)
  if (!key) {
    setResponseStatus(event, 500)
    return { result: null }
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('key', key)

  try {
    const res = await fetch(url.toString())
    const data = await res.json()
    if (data.status !== 'OK') return { result: null }
    return { result: data.result }
  } catch {
    setResponseStatus(event, 502)
    return { result: null }
  }
})
