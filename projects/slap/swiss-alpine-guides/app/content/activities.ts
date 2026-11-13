import catalogue from './activities.json'
export interface ActivityProgram { name: string; description: string; facts: { label: string; value: string }[] }
export interface Activity {
  slug: string; name: string; seasons: string[]; source: string; sources?: string[]; checked: string;
  summary: string; programs: ActivityProgram[]; common?: ActivityProgram[]; dates?: string[];
  image: string; imageSource: string; path: string; note?: string; legacy?: boolean; heliski?: boolean; related?: string[];
}
export const activities = catalogue as Activity[]
export const featuredSlugs = ['via-ferrata', 'glacier-trekking', 'mountaineering', 'heliskiing', 'snowshoe-trekking', 'avalanche-courses']
export const featuredActivities = featuredSlugs.map(slug => activities.find(item => item.slug === slug)!)
export const activityMetadata = (activity: Activity) => ({ title: `${activity.name} | Swiss Alpine Guides, Interlaken`, description: activity.summary, path: activity.path })
