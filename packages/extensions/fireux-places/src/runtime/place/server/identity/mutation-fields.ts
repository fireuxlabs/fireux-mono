export const optionalPlaceTextFields = new Map<string, number>([
  ['short_name', 120],
  ['tagline', 240],
  ['about', 10_000],
  ['formatted_address', 500],
  ['short_address', 240],
  ['search_term', 1_000],
  ['image_url', 2_048],
  ['cover_image', 2_048],
  ['logo_image', 2_048],
  ['wordmark_image', 2_048],
  ['phone', 120],
  ['email', 320],
  ['website', 2_048],
])

export const allowedPlaceSocialKeys = new Set([
  'instagram',
  'facebook',
  'tiktok',
  'linkedin',
  'youtube',
])

export const allowedPlacePatchKeys = new Set([
  'name',
  ...optionalPlaceTextFields.keys(),
  'lat',
  'lng',
  'media_backdrop_color',
  'gallery_images',
  'social_links',
  'default_currency_code',
  'timezone',
  'business_hours',
  'brand_palette',
])
