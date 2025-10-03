export default defineEventHandler(async (event: any) => {
  const { q } = getQuery(event)
  const query = String(q || '')
  if (!query) return { predictions: [] }

  const config = useRuntimeConfig()
  const key = config.googlePlacesApiKey
  if (!key) {
    return { predictions: [], error: 'Missing googlePlacesApiKey' }
  }

  const url = new URL(
    'https://maps.googleapis.com/maps/api/place/autocomplete/json'
  )
  url.searchParams.set('input', query)
  url.searchParams.set('key', key)

  const res = await fetch(url.toString())
  const data = await res.json()
  return data
})
