import type { Ref } from 'vue'
import type { AppModel } from '../../../../../../../models/core/app.model'
import type { AppSocialLinks } from '../../../../../../../models/core/app.supporting'
import { useResolvedColorMode } from '../../../../../app/useColorMode'

export namespace AppCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    thumbnailUrl: string

    displayName: string
    ecosystem: string
    badges: string[]

    tagline: string
    shortName: string
    role: string
    userCount: number

    description: string
    shortBio: string
    longBio: string

    logoUrl: string
    wordmarkLightUrl: string
    wordmarkDarkUrl: string

    // Always safe to render (empty string if none)
    wordmarkUrl: string

    socialLinks: AppSocialLinks
  }
}

function safeMedia(app: AppModel) {
  return (
    app.media ?? {
      thumbnail_url: '',
      logo_url: '',
      wordmark_light_url: '',
      wordmark_dark_url: '',
      cover_url: '',
    }
  )
}

function safeDerived(app: AppModel) {
  return app.derived ?? { user_count: 0 }
}

export function useAppInterface(appRef?: Ref<AppModel | null | undefined>) {
  const resolvedMode = useResolvedColorMode()

  function resolveWordmarkUrl(app: AppModel): string {
    const media = safeMedia(app)
    return resolvedMode.value === 'dark'
      ? media.wordmark_dark_url
      : media.wordmark_light_url
  }

  function map(app: AppModel): AppCard.Card {
    const media = safeMedia(app)
    const derived = safeDerived(app)

    return {
      id: app.id,
      to: `/apps/${encodeURIComponent(app.id)}`,

      thumbnailUrl: media.thumbnail_url,

      displayName: app.app_name,
      ecosystem: app.ecosystem,
      badges: [],

      tagline: app.tagline,
      shortName: app.app_short_name,
      role: app.role != null ? String(app.role) : '',
      userCount: typeof derived.user_count === 'number' ? derived.user_count : 0,

      description: app.description,
      shortBio: app.short_bio,
      longBio: app.long_bio,

      logoUrl: media.logo_url,
      wordmarkLightUrl: media.wordmark_light_url,
      wordmarkDarkUrl: media.wordmark_dark_url,
      wordmarkUrl: resolveWordmarkUrl(app),

      socialLinks: (app.social_links ?? {}) as AppSocialLinks,
    }
  }

  function card(target?: AppModel | null | undefined): AppCard.Card | null {
    const app = target ?? appRef?.value ?? null
    return app ? map(app) : null
  }

  function searchText(app: AppModel): string {
    return `${app.app_name} ${app.app_short_name} ${app.ecosystem} ${app.id}`
      .toLowerCase()
  }

  return { card, searchText }
}
