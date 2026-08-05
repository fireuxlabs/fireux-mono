import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'

const text = (value: unknown) => String(value ?? '').trim()

export function resolveGoogleMapsApiKey(event?: H3Event) {
  const runtime = useRuntimeConfig(event) as Record<string, any>
  const candidates = [
    { source: 'runtime.googleMapsApiKey', value: runtime.googleMapsApiKey },
    { source: 'runtime.googlePlacesApiKey', value: runtime.googlePlacesApiKey },
    {
      source: 'public.fireux.places.googleMaps.apiKey',
      value: runtime.public?.fireux?.places?.googleMaps?.apiKey,
    },
    {
      source: 'env.GOOGLE_MAPS_API_KEY',
      value: process.env.GOOGLE_MAPS_API_KEY,
    },
    {
      source: 'env.NUXT_GOOGLE_MAPS_API_KEY',
      value: process.env.NUXT_GOOGLE_MAPS_API_KEY,
    },
    {
      source: 'env.GOOGLE_PLACES_API_KEY',
      value: process.env.GOOGLE_PLACES_API_KEY,
    },
    {
      source: 'env.NUXT_GOOGLE_PLACES_API_KEY',
      value: process.env.NUXT_GOOGLE_PLACES_API_KEY,
    },
    {
      source: 'env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY',
      value: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
    {
      source: 'env.NUXT_PUBLIC_GOOGLE_PLACES_API_KEY',
      value: process.env.NUXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    },
  ]
  const found = candidates.find((candidate) => text(candidate.value))

  return {
    key: text(found?.value),
    source: found?.source || 'missing',
  }
}

export function resolveGooglePlacesApiKey(event?: H3Event) {
  const runtime = useRuntimeConfig(event) as Record<string, any>
  const candidates = [
    { source: 'runtime.googlePlacesApiKey', value: runtime.googlePlacesApiKey },
    {
      source: 'env.GOOGLE_PLACES_API_KEY',
      value: process.env.GOOGLE_PLACES_API_KEY,
    },
    {
      source: 'env.NUXT_GOOGLE_PLACES_API_KEY',
      value: process.env.NUXT_GOOGLE_PLACES_API_KEY,
    },
    {
      source: 'env.NUXT_PUBLIC_GOOGLE_PLACES_API_KEY',
      value: process.env.NUXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    },
    {
      source: 'public.fireux.places.googleMaps.apiKey',
      value: runtime.public?.fireux?.places?.googleMaps?.apiKey,
    },
    { source: 'runtime.googleMapsApiKey', value: runtime.googleMapsApiKey },
    {
      source: 'env.GOOGLE_MAPS_API_KEY',
      value: process.env.GOOGLE_MAPS_API_KEY,
    },
    {
      source: 'env.NUXT_GOOGLE_MAPS_API_KEY',
      value: process.env.NUXT_GOOGLE_MAPS_API_KEY,
    },
    {
      source: 'env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY',
      value: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  ]
  const found = candidates.find((candidate) => text(candidate.value))

  return {
    key: text(found?.value),
    source: found?.source || 'missing',
  }
}
