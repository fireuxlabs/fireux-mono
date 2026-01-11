
import type { Ref } from 'vue'
import type { App } from '../../packages/core/fireux-core/src/runtime/models/core/app.model'
import type { AppSocialLinks } from '../../packages/core/fireux-core/src/runtime/models/core/app.supporting'
import { useResolvedColorMode } from '../../packages/core/fireux-core/src/runtime/composables/fireux/app/useColorMode'

export namespace AppCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

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

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolvedMode = useResolvedColorMode()

  function resolveWordmarkUrl(app: App): string {
    return resolvedMode.value === 'dark'
      ? app.wordmark_dark_url
      : app.wordmark_light_url
  }

  function map(app: App): AppCard.Card {
    return {
      id: app.id,
      to: `/apps/${app.id}`,

      avatarUrl: app.thumbnail_url,

      displayName: app.app_name,
      ecosystem: app.ecosystem,
      badges: [],

      tagline: app.tagline,
      shortName: app.app_short_name,
      role: String(app.role),
      userCount: app.user_count,

      description: app.description,
      shortBio: app.short_bio,
      longBio: app.long_bio,

      logoUrl: app.logo_url,
      wordmarkLightUrl: app.wordmark_light_url,
      wordmarkDarkUrl: app.wordmark_dark_url,
      wordmarkUrl: resolveWordmarkUrl(app),

      socialLinks: app.social_links,
    }
  }

  function card(target?: App | null | undefined): AppCard.Card | null {
    const app = target ?? appRef?.value ?? null
    return app ? map(app) : null
  }

  function searchText(app: App): string {
    return `${app.app_name} ${app.app_short_name} ${app.ecosystem} ${app.id}`
      .toLowerCase()
  }

  return { card, searchText }
}
