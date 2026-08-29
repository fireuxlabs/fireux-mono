import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'

export const resolveKitchenPath = (target: {
  id?: string
  slug?: string
  route_scope?: 'live' | 'demo' | 'test'
}) => {
  const slug = safeString(target.slug)
  if (!slug) return ''

  if (target.route_scope === 'demo' || target.route_scope === 'test') {
    return ''
  }

  return `/kitchens/${encodeURIComponent(slug)}`
}

export const meaningfulSurfaceDelta = (value: unknown) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, item]) => {
      if (typeof item === 'string') return Boolean(item.trim())
      if (Array.isArray(item)) return item.length > 0
      if (typeof item === 'object' && item) return Object.keys(item).length > 0
      return item !== null && item !== undefined
    })
  )
}

export const placeBaselineKeys = [
  'name',
  'short_name',
  'tagline',
  'about',
  'formatted_address',
  'short_address',
  'address',
  'lat',
  'lng',
  'timezone',
  'image_url',
  'cover_image',
  'gallery_images',
  'image_shade',
  'phone',
  'email',
  'website',
  'google_maps_url',
  'social_links',
] as const
