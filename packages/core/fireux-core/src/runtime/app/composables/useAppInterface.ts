import { safeString } from '../../composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import { type App } from '../models/app.model.ts'
import { resolveAppMediaForView } from './firestore/utils/appMedia'
import { useResolvedColorMode } from '../../composables/theme/useColorMode'

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
    userCount: number | null

    description: string
    shortBio: string
    longBio: string

    logoUrl: string
    wordmarkLightUrl: string
    wordmarkDarkUrl: string
    coverUrl: string

    // Always safe to render (empty string if none)
    wordmarkUrl: string

    socialLinks: App['social_links']
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

function makeAvatarText(app: App): string {
  const source = safeString(app.short_name || app.name || app.id)
  if (!source) return ''

  return source
    .split(/[\s-_]+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export function useAppInterface(
  appRef?: Ref<App | null | undefined>
) {
  const resolvedMode = useResolvedColorMode()
  type AppPill = AppCard.Card
  type AppCell = AppCard.Card
  type AppPreview = AppCard.Card
  type AppProfile = AppCard.Card

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
    const id = safeString(app.id).trim()
    const ecosystemId = safeString(app.ecosystem_id)
    const name = safeString(app.name)
    const shortName = safeString(app.short_name)

    return {
      id,
      to: id ? `/apps/${encodeURIComponent(id)}` : '',

      imageUrl: safeString(media.thumbnailUrl) || safeString(media.logoUrl),
      avatarUrl: safeString(media.thumbnailUrl) || safeString(media.logoUrl),
      avatarText: makeAvatarText(app),
      thumbnailUrl: safeString(media.thumbnailUrl),

      title: name,
      subtitle: ecosystemId,
      displayName: name,
      ecosystem: ecosystemId,
      badges: [app.role, ecosystemId]
        .map((value) => safeString(value))
        .filter(Boolean),

      summary: safeString(app.description),
      status: app.role != null ? String(app.role) : '',
      ownerLabel: '',
      locationLabel: '',

      tagline: safeString(app.tagline),
      shortName,
      role: app.role != null ? String(app.role) : '',
      userCount: null,

      description: safeString(app.description),
      shortBio: safeString(app.short_bio || app.description),
      longBio: safeString(app.long_bio || app.description),

      logoUrl: safeString(media.logoUrl),
      wordmarkLightUrl: safeString(media.wordmarkLightUrl),
      wordmarkDarkUrl: safeString(media.wordmarkDarkUrl),
      coverUrl: safeString(media.coverUrl),
      wordmarkUrl: resolveWordmarkUrl(app),

      socialLinks: app.social_links,
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

  function preview(
    target?: App | null | undefined
  ): AppPreview | null {
    return buildInterface(target)
  }

  function profile(
    target?: App | null | undefined
  ): AppProfile | null {
    return buildInterface(target)
  }

  return {
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
