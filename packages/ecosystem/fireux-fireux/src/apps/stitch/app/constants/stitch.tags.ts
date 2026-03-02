export const STITCH_TAGS = [
  'technical-seo',
  'local-seo',
  'content-strategy',
  'on-page',
  'link-building',
  'shopify-seo',
  'analytics-ga4',
  'gsc',
  'site-migrations',
  'audits',
] as const

export const STITCH_TAG_OPTIONS = STITCH_TAGS.map((tag) => ({
  label: tag,
  value: tag,
}))
