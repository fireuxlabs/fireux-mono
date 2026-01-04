// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts

import type { Ref } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'

export namespace AppCard {
  export type Card = {
    id: string
    to: string

    avatar: string
    title: string
    subtitle: string
    badges: string[]

    tagline: string
    shortName: string
    role: string
    userCount: number | null

    description: string
    shortBio: string
    longBio: string

    logo: string
    wordmark: string
    instagram: string
  }
}

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  function map(app: App): AppCard.Card {
    return {
      id: app.id,
      to: `/apps/${app.id}`,

      avatar: app.avatar_url || '',
      title: app.app_name || '',
      subtitle: app.ecosystem || '',
      badges: [],

      tagline: app.tagline || '',
      shortName: app.app_short_name || '',
      role: app.role || '',
      userCount: app.user_count ?? null,

      description: app.description || '',
      shortBio: app.short_bio || '',
      longBio: app.long_bio || '',

      logo: app.logo_url || '',
      wordmark: app.wordmark_light_url || app.wordmark_dark_url || '',
      instagram: app.social_links?.instagram || '',
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