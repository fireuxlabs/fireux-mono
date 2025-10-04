// Example implementation for details.get.ts
export default defineEventHandler(async (event: any) => {
  const queryParams = getQuery(event)
  const placeId = queryParams.place_id as string | undefined
  if (!placeId) return { result: null }

  const config = useRuntimeConfig()
  const key = config.googlePlacesApiKey as string | undefined
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
