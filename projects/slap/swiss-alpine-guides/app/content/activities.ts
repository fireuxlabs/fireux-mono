import catalogue from './activities.json'
export interface ActivityProgram {
  name: string
  description: string
  facts: { label: string; value: string }[]
}
export interface Activity {
  slug: string
  name: string
  seasons: string[]
  source: string
  sources?: string[]
  checked: string
  summary: string
  programs: ActivityProgram[]
  common?: ActivityProgram[]
  dates?: string[]
  imageFocus?: string
  image: string
  imageSource: string
  path: string
  note?: string
  legacy?: boolean
  heliski?: boolean
  related?: string[]
}
export const activities = catalogue as Activity[]
export const featuredSlugs = [
  'via-ferrata',
  'glacier-trekking',
  'mountaineering',
  'heliskiing',
  'snowshoe-trekking',
  'avalanche-courses',
]
export const featuredActivities = featuredSlugs.map(
  (slug) => activities.find((item) => item.slug === slug)!
)
export const activityMetadata = (activity: Activity) => ({
  title: `${activity.name} | Swiss Alpine Guides, Interlaken`,
  description: activity.summary,
  path: activity.path,
})

// Photo delivery stays with the App's activity catalogue and native picture consumers.
export const activityImageSources = (
  image: string,
  format: 'webp' | 'avif' = 'webp',
  surface: 'card' | 'hero' = 'card'
) => {
  const restored = image.includes('/activities/restored-v1/')
  if (!restored && !image.includes('/activities/developed/')) return undefined
  const maximum = restored ? 4000 : 1000
  const widths = restored
    ? surface === 'hero'
      ? [1000, 2000, 4000]
      : [500, 1000]
    : [500, 750, 1000]
  return widths
    .map(
      (width) =>
        `${image.replace('.webp', `${width === maximum ? '' : `-${width}`}.${format}`)} ${width}w`
    )
    .join(', ')
}

export const activityImageFocus = (image: string) =>
  activities.find((activity) => activity.image === image)?.imageFocus ||
  '50% 50%'
