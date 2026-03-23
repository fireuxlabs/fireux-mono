import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'
import type { AppSocialLinks } from '../../../../../../../models/core/supporting/app'
import { useResolvedColorMode } from '../../../../../app/useColorMode'

export namespace AppCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string
    thumbnailUrl: string

    title: string
    subtitle: string
    displayName: string
    ecosystem: string
    badges: string[]

    summary: string
    status: string
    ownerLabel: string
    locationLabel: string

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

function safeMedia(app: App) {
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

function safeDerived(app: App) {
  return app.derived ?? { user_count: 0 }
}

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolvedMode = useResolvedColorMode()
  type AppPill = AppCard.Card
  type AppCell = AppCard.Card
  type AppPreview = AppCard.Card
  type AppProfile = AppCard.Card

  function resolveWordmarkUrl(app: App): string {
    const media = safeMedia(app)
    return resolvedMode.value === 'dark'
      ? media.wordmark_dark_url
      : media.wordmark_light_url
  }

  function map(app: App): AppCard.Card {
    const media = safeMedia(app)
    const derived = safeDerived(app)
    const id = safeString(app.id).trim()

    return {
      id,
      to: id ? `/apps/${encodeURIComponent(id)}` : '',

      avatarUrl: safeString(media.thumbnail_url) || safeString(media.logo_url),
      thumbnailUrl: safeString(media.thumbnail_url),

      title: safeString(app.app_name),
      subtitle: safeString(app.tagline) || safeString(app.ecosystem),
      displayName: safeString(app.app_name),
      ecosystem: safeString(app.ecosystem),
      badges: [],

      summary: safeString(app.short_bio) || safeString(app.description),
      status: app.role != null ? String(app.role) : '',
      ownerLabel: '',
      locationLabel: '',

      tagline: safeString(app.tagline),
      shortName: safeString(app.app_short_name),
      role: app.role != null ? String(app.role) : '',
      userCount: typeof derived.user_count === 'number' ? derived.user_count : 0,

      description: safeString(app.description),
      shortBio: safeString(app.short_bio),
      longBio: safeString(app.long_bio),

      logoUrl: safeString(media.logo_url),
      wordmarkLightUrl: safeString(media.wordmark_light_url),
      wordmarkDarkUrl: safeString(media.wordmark_dark_url),
      wordmarkUrl: resolveWordmarkUrl(app),

      socialLinks: (app.social_links ?? {}) as AppSocialLinks,
    }
  }

  function buildInterface(target?: App | null | undefined): AppCard.Card | null {
    const app = target ?? appRef?.value ?? null
    if (!app) return null
    const mapped = map(app)
    return mapped.id ? mapped : null
  }

  function pill(target?: App | null | undefined): AppPill | null {
    return buildInterface(target)
  }

  function cell(target?: App | null | undefined): AppCell | null {
    return buildInterface(target)
  }

  function preview(target?: App | null | undefined): AppPreview | null {
    return buildInterface(target)
  }

  function profile(target?: App | null | undefined): AppProfile | null {
    return buildInterface(target)
  }

  function searchText(app: App): string {
    const name = safeString(app.app_name)
    const shortName = safeString(app.app_short_name)
    const ecosystem = safeString(app.ecosystem)
    const id = safeString(app.id)
    return `${name} ${shortName} ${ecosystem} ${id}`.trim().toLowerCase()
  }

  return { interface: buildInterface, pill, cell, preview, profile, searchText }
}
