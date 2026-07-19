import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import {
  AppStorage,
  type App,
} from '../../../../../../../models/core/app.model'
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
    coverUrl: string

    // Always safe to render (empty string if none)
    wordmarkUrl: string

    socialLinks: AppSocialLinks
  }
}

export type AppSurfaceParts<TApp extends object = Partial<App>> = {
  app?: TApp | null | undefined
}

export type AppViewSource = Partial<App> & {
  detail_url?: string
  /** Narrow legacy read adapter. Canonical identity is ecosystem_id. */
  ecosystem?: string
}

function safeMedia(app: AppViewSource) {
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

function safeDerived(app: AppViewSource) {
  return app.derived ?? { user_count: 0 }
}

function makeAvatarText(app: AppViewSource): string {
  const source = safeString(app.app_short_name || app.app_name || app.id)
  if (!source) return ''

  return source
    .split(/[\s-_]+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export function useAppInterface(
  appRef?: Ref<AppViewSource | null | undefined>
) {
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

  function resolveWordmarkUrl(app: AppViewSource): string {
    const media = resolveAppMediaForView(safeMedia(app), {
      devLocalFallback: false,
    })
    return resolvedMode.value === 'dark'
      ? media.wordmarkDarkUrl
      : media.wordmarkLightUrl
  }

  function map(app: AppViewSource): AppCard.Card {
    const media = resolveAppMediaForView(safeMedia(app), {
      devLocalFallback: false,
    })
    const derived = safeDerived(app)
    const id = safeString(app.id).trim()
    const ecosystemId = safeString(app.ecosystem_id || app.ecosystem)

    return {
      id,
      to:
        safeString(app.detail_url) ||
        (id ? `/${AppStorage.collection}/${encodeURIComponent(id)}` : ''),

      imageUrl: safeString(media.thumbnailUrl) || safeString(media.logoUrl),
      avatarUrl: safeString(media.thumbnailUrl) || safeString(media.logoUrl),
      avatarText: makeAvatarText(app),
      thumbnailUrl: safeString(media.thumbnailUrl),

      title: safeString(app.app_name),
      subtitle: safeString(app.tagline) || ecosystemId,
      displayName: safeString(app.app_name),
      ecosystem: ecosystemId,
      badges: [app.role, ecosystemId]
        .map((value) => safeString(value))
        .filter(Boolean),

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
      coverUrl: safeString(media.coverUrl),
      wordmarkUrl: resolveWordmarkUrl(app),

      socialLinks: (app.social_links ?? {}) as AppSocialLinks,
    }
  }

  function buildInterface(
    target?: AppViewSource | null | undefined
  ): AppCard.Card | null {
    const app = target ?? appRef?.value ?? null
    if (!app) return null
    const mapped = map(app)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: AppViewSource | null | undefined): AppPill | null {
    return buildInterface(target)
  }

  function cell(target?: AppViewSource | null | undefined): AppCell | null {
    return buildInterface(target)
  }

  function preview(
    target?: AppViewSource | null | undefined
  ): AppPreview | null {
    return buildInterface(target)
  }

  function profile(
    target?: AppViewSource | null | undefined
  ): AppProfile | null {
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
