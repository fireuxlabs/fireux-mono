// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts

import type { Ref } from 'vue'
import type { App, AppSocialLinks } from '../../../../../../../models/core/app.model'
import { computed } from '#imports'
import { useResolvedColorMode } from '../../../../../app/useColorMode'

export namespace AppCard {
  export type Card = {
    id: string
    to: string

    // media is optional in the model, so it’s optional in the DTO
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

    // media is optional in the model, so it’s optional in the DTO
    logo?: string
    wordmarkLight?: string
    wordmarkDark?: string

    // resolved wordmark can be empty-string if none exists
    wordmark: string

    socialLinks: AppSocialLinks
  }
}

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolvedMode = useResolvedColorMode()
  const prefersLightWordmark = computed(() => resolvedMode.value === 'dark')

  const resolveWordmark = (app: App) => {
    // On dark backgrounds, we want the light wordmark (and vice versa).
    const src = prefersLightWordmark.value ? app.wordmark_light_url : app.wordmark_dark_url
    return src ?? ''
  }

  function map(app: App): AppCard.Card {
    return {
      id: app.id,
      to: `/apps/${app.id}`,

      // prefer thumbnail_url, then legacy avatar_url
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

  function card(target: App): AppCard.Card
  function card(target?: App | null | undefined): AppCard.Card | null
  function card(target?: App | null | undefined): AppCard.Card | null {
    const app = target ?? appRef?.value
    return app ? map(app) : null
  }

  return { card }
}