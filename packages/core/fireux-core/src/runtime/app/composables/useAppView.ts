import { safeString } from '../../composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import { type App } from '../models/app.model.ts'
import { resolveAppMediaForView } from '../utils/app-media'
import { useResolvedColorMode } from '../../composables/theme/useColorMode'

export type AppCard = {
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

    logoUrl: string
    wordmarkLightUrl: string
    wordmarkDarkUrl: string
    coverUrl: string

    // Always safe to render (empty string if none)
    wordmarkUrl: string

  socialLinks: App['social_links']
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

export function useAppView(
  appRef?: Ref<App | null | undefined>
) {
  const resolvedMode = useResolvedColorMode()

  function resolveWordmarkUrl(app: App): string {
    const media = resolveAppMediaForView(safeMedia(app), {
      owningAppBundle: false,
    })
    return resolvedMode.value === 'dark'
      ? media.wordmarkDarkUrl
      : media.wordmarkLightUrl
  }

  function map(app: App): AppCard {
    const media = resolveAppMediaForView(safeMedia(app), {
      owningAppBundle: false,
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
      status: app.status,
      ownerLabel: '',
      locationLabel: '',

      tagline: safeString(app.tagline),
      shortName,
      role: app.role != null ? String(app.role) : '',
      userCount: null,

      description: safeString(app.description),

      logoUrl: safeString(media.logoUrl),
      wordmarkLightUrl: safeString(media.wordmarkLightUrl),
      wordmarkDarkUrl: safeString(media.wordmarkDarkUrl),
      coverUrl: safeString(media.coverUrl),
      wordmarkUrl: resolveWordmarkUrl(app),

      socialLinks: app.social_links,
    }
  }

  function toCard(
    target?: App | null | undefined
  ): AppCard | null {
    const app = target ?? appRef?.value ?? null
    if (!app) return null
    const mapped = map(app)
    return mapped.id ? mapped : null
  }

  return { toCard }
}
