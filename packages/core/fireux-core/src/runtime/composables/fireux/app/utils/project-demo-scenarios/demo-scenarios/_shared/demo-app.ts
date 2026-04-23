import { AppModel } from '../../../../../../../models/core/app.model'
import type { App } from '../../../../../../../models/core/app.model'

type DemoAppInput = Omit<
  Partial<App>,
  'social_links' | 'derived' | 'media' | 'created' | 'updated'
> & {
  id: string
  project_id: string
  slug: string
  app_name: string
  app_short_name: string
  thumbnail_url?: string
  logo_url?: string
}

export function createDemoApp(input: DemoAppInput): App {
  const mediaUrl = String(input.thumbnail_url || input.logo_url || '').trim()

  return {
    ...AppModel,
    ...input,
    social_links: {
      website: '',
      twitter: '',
      github: '',
      linkedin: '',
      instagram: '',
      facebook: '',
      youtube: '',
      email: '',
    },
    derived: {
      user_count: 0,
    },
    media: {
      thumbnail_url: mediaUrl,
      logo_url: String(input.logo_url || mediaUrl).trim(),
      wordmark_light_url: '',
      wordmark_dark_url: '',
      cover_url: '',
    },
    join_requests: [],
    admin_ids: [],
    ban_reasons: [],
    created: {
      at: {},
      by: undefined,
      app_id: undefined,
    },
    updated: {
      at: {},
      by: undefined,
    },
  }
}
