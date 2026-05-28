import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import { AppStorage, type App } from '../../../../../../../models/core/app.model'
import type { AppSocialLinks } from '../../../../../../../models/core/supporting/app'
import { useResolvedColorMode } from '../../../../../app/useColorMode'
import { resolveAppMediaForView } from '../appMedia'

export namespace AppCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    imageUrl: string
    avatarUrl: string
    avatarText: string
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

export type AppSurfaceParts<TApp extends object = Partial<App>> = {
  app?: TApp | null | undefined
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

function makeAvatarText(app: App): string {
  const source = safeString(app.app_short_name || app.app_name || app.id)
  if (!source) return ''

  return source
    .split(/[\s-_]+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolvedMode = useResolvedColorMode()
  type AppPill = AppCard.Card
  type AppCell = AppCard.Card
  type AppPreview = AppCard.Card
  type AppProfile = AppCard.Card

  function surface<TApp extends object = Partial<App>>(
    parts: AppSurfaceParts<TApp>
  ): (TApp & App) | null {
    const source = parts.app ?? null
    if (!source) return null

    const id = safeString((source as Partial<App>).id).trim()
    if (!id) return null

    return {
      ...source,
      id,
    } as TApp & App
  }

  function resolveWordmarkUrl(app: App): string {
    const media = resolveAppMediaForView(safeMedia(app), {
      devLocalFallback: false,
    })
    return resolvedMode.value === 'dark'
      ? media.wordmarkDarkUrl
      : media.wordmarkLightUrl
  }

  function map(app: App): AppCard.Card {
    const media = resolveAppMediaForView(safeMedia(app), {
      devLocalFallback: false,
    })
    const derived = safeDerived(app)
    const id = safeString(app.id).trim()

    return {
      id,
      to: id ? `/${AppStorage.collection}/${encodeURIComponent(id)}` : '',

      imageUrl: safeString(media.thumbnailUrl) || safeString(media.logoUrl),
      avatarUrl: safeString(media.thumbnailUrl) || safeString(media.logoUrl),
      avatarText: makeAvatarText(app),
      thumbnailUrl: safeString(media.thumbnailUrl),

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
      userCount:
        typeof derived.user_count === 'number' ? derived.user_count : 0,

      description: safeString(app.description),
      shortBio: safeString(app.short_bio),
      longBio: safeString(app.long_bio),

      logoUrl: safeString(media.logoUrl),
      wordmarkLightUrl: safeString(media.wordmarkLightUrl),
      wordmarkDarkUrl: safeString(media.wordmarkDarkUrl),
      wordmarkUrl: resolveWordmarkUrl(app),

      socialLinks: (app.social_links ?? {}) as AppSocialLinks,
    }
  }

  function buildInterface(
    target?: App | null | undefined
  ): AppCard.Card | null {
    const app = target ?? appRef?.value ?? null
    if (!app) return null
    const mapped = map(app)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

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

  return {
    surface,
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
