import type { AppModel } from '../../../../../models/core/app.model'

const EMPTY_SOCIAL_LINKS = {
  website: '',
  twitter: '',
  github: '',
  linkedin: '',
  instagram: '',
  facebook: '',
  youtube: '',
  email: '',
} as const

export type ReadOnlyAppScenario = {
  id: string
  name: string
  label: string
  manager_display_name: string
  manager_avatar_url: string
  app: AppModel
}

export type ReadOnlyAppScenarioListItem = {
  id: string
  name: string
  label: string
  image_url: string
  manager_display_name: string
  manager_avatar_url: string
  mode: 'read-only'
}

export type ScenarioKey =
  | 'fireux-control-room'
  | 'fireux-labs'
  | 'fireux-observatory'

export const scenarioKeys: ScenarioKey[] = [
  'fireux-control-room',
  'fireux-labs',
  'fireux-observatory',
]

const SCENARIOS_BY_KEY: Record<ScenarioKey, ReadOnlyAppScenario> = {
  'fireux-control-room': {
    id: 'fireux-control-room',
    name: 'FireUX Control Room',
    label: 'Core platform operations',
    manager_display_name: 'Taylor Finch',
    manager_avatar_url: 'https://i.pravatar.cc/256?u=taylor-finch',
    app: {
      id: 'fireux-control-room',
      app_name: 'FireUX Control Room',
      app_short_name: 'Control Room',
      role: 'global',
      ecosystem: 'fireux',
      tagline: 'Platform control for apps, modules, and ecosystems.',
      description: 'Read-only app runtime scenario for control-room operations.',
      short_bio: 'Core operations runtime',
      long_bio: '',
      social_links: { ...EMPTY_SOCIAL_LINKS },
      derived: { user_count: 1240 },
      media: {
        thumbnail_url:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=512&h=512&q=80',
        logo_url: '',
        wordmark_light_url: '',
        wordmark_dark_url: '',
        cover_url: '',
      },
      join_requests: [],
      admin_ids: [],
      moderation_state: 'ok',
      ban_reasons: [],
      console_enabled: true,
      created: { at: {} as any, by: 'system' },
      updated: { at: {} as any, by: 'system' },
    },
  },
  'fireux-labs': {
    id: 'fireux-labs',
    name: 'FireUX Labs',
    label: 'Experimental runtime surfaces',
    manager_display_name: 'Taylor Finch',
    manager_avatar_url: 'https://i.pravatar.cc/256?u=taylor-finch',
    app: {
      id: 'fireux-labs',
      app_name: 'FireUX Labs',
      app_short_name: 'Labs',
      role: 'global',
      ecosystem: 'fireux',
      tagline: 'Prototype and validate next-generation modules.',
      description: 'Read-only app runtime scenario for labs workflows.',
      short_bio: 'Experimentation runtime',
      long_bio: '',
      social_links: { ...EMPTY_SOCIAL_LINKS },
      derived: { user_count: 370 },
      media: {
        thumbnail_url:
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=512&h=512&q=80',
        logo_url: '',
        wordmark_light_url: '',
        wordmark_dark_url: '',
        cover_url: '',
      },
      join_requests: [],
      admin_ids: [],
      moderation_state: 'ok',
      ban_reasons: [],
      console_enabled: true,
      created: { at: {} as any, by: 'system' },
      updated: { at: {} as any, by: 'system' },
    },
  },
  'fireux-observatory': {
    id: 'fireux-observatory',
    name: 'FireUX Observatory',
    label: 'Insights and telemetry runtime',
    manager_display_name: 'Casey Rowan',
    manager_avatar_url: 'https://i.pravatar.cc/256?u=casey-rowan',
    app: {
      id: 'fireux-observatory',
      app_name: 'FireUX Observatory',
      app_short_name: 'Observatory',
      role: 'global',
      ecosystem: 'fireux',
      tagline: 'Monitor health, usage, and risk signals across FireUX.',
      description: 'Read-only app runtime scenario for observability workflows.',
      short_bio: 'Insights runtime',
      long_bio: '',
      social_links: { ...EMPTY_SOCIAL_LINKS },
      derived: { user_count: 810 },
      media: {
        thumbnail_url:
          'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=512&h=512&q=80',
        logo_url: '',
        wordmark_light_url: '',
        wordmark_dark_url: '',
        cover_url: '',
      },
      join_requests: [],
      admin_ids: [],
      moderation_state: 'ok',
      ban_reasons: [],
      console_enabled: true,
      created: { at: {} as any, by: 'system' },
      updated: { at: {} as any, by: 'system' },
    },
  },
}

const normalize = (value: unknown) => String(value || '').trim()

const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

export const getReadOnlyAppScenario = (
  appId?: string
): ReadOnlyAppScenario | null => {
  const candidate = normalize(appId)
  if (!candidate || !isScenarioKey(candidate)) return null
  return SCENARIOS_BY_KEY[candidate] ?? null
}

export const getReadOnlyAppScenarioList = (): ReadOnlyAppScenarioListItem[] =>
  scenarioKeys.map((key) => {
    const scenario = SCENARIOS_BY_KEY[key]
    return {
      id: scenario.id,
      name: scenario.name,
      label: scenario.label,
      image_url: scenario.manager_avatar_url,
      manager_display_name: scenario.manager_display_name,
      manager_avatar_url: scenario.manager_avatar_url,
      mode: 'read-only',
    }
  })
