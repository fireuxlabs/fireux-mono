// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts

import type { Ref } from 'vue'
import type { App, AppSocialLinks } from '../../../../../../../models/core/app.model'
import { useResolvedColorMode } from '../../../../../app/useColorMode'

export namespace AppCard {
  export type Card = {
    id: string
    to: string

    // Media (optional in model → optional in DTO)
    avatar?: string

    title: string
    subtitle: string
    badges: string[]

    tagline: string
    shortName: string
    role: string
    userCount: number

    description: string
    shortBio: string
    longBio: string

    logo?: string
    wordmarkLight?: string
    wordmarkDark?: string

    // Always safe to render (empty string if none)
    wordmark: string

    socialLinks: AppSocialLinks
  }
}

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolvedMode = useResolvedColorMode()

  function resolveWordmark(app: App): string {
    return resolvedMode.value === 'dark'
      ? app.wordmark_light_url ?? ''
      : app.wordmark_dark_url ?? ''
  }

  function map(app: App): AppCard.Card {
    return {
      id: app.id,
      to: `/apps/${app.id}`,

      avatar: app.thumbnail_url ?? app.avatar_url,

      title: app.app_name,
      subtitle: app.ecosystem,
      badges: [],

      tagline: app.tagline,
      shortName: app.app_short_name,
      role: app.role,
      userCount: app.user_count,

      description: app.description,
      shortBio: app.short_bio,
      longBio: app.long_bio,

      logo: app.logo_url,
      wordmarkLight: app.wordmark_light_url,
      wordmarkDark: app.wordmark_dark_url,
      wordmark: resolveWordmark(app),

      socialLinks: app.social_links,
    }
  }

  function card(target?: App | null): AppCard.Card | null {
    const app = target ?? appRef?.value
    return app ? map(app) : null
  }

  return { card }
}