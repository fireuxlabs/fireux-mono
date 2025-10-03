export default defineEventHandler(async (event: any) => {
  const { id } = getQuery(event)
  const placeId = String(id || '')
  if (!placeId) return { result: null }

  const config = useRuntimeConfig()
  const key = config.googlePlacesApiKey
  if (!key) {
    return { result: null, error: 'Missing googlePlacesApiKey' }
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set(
    'fields',
    'place_id,formatted_address,name,geometry,address_components'
  )
  url.searchParams.set('key', key)

  const res = await fetch(url.toString())
  const data = await res.json()
  return data
})
