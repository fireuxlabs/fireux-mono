import type { App } from '../models/app.model.ts'
import { resolveAppMediaForView } from '../media/utils'

export type AppCard = {
  id: string
  to: string
  name: string
  ecosystemId: string
  thumbnailUrl: string
  logoUrl: string
  coverUrl: string
  avatarText: string
  badges: string[]
  tagline: string | undefined
  shortName: string | undefined
  description: string | undefined
}

function makeAvatarText(name: string): string {
  const source = name.trim()
  if (!source) return ''

  return source
    .split(/[\s-_]+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export function useAppView() {
  function toCard(app: App | null | undefined): AppCard | null {
    if (!app) return null

    const media = resolveAppMediaForView(app.media, {
      owningAppBundle: false,
    })

    return {
      id: app.id,
      to: `/apps/${encodeURIComponent(app.id)}`,
      name: app.name,
      ecosystemId: app.ecosystem_id,
      thumbnailUrl: media.thumbnailUrl,
      logoUrl: media.logoUrl,
      coverUrl: media.coverUrl,
      avatarText: makeAvatarText(app.name),
      badges: [app.role, app.ecosystem_id],
      tagline: app.tagline,
      shortName: app.short_name,
      description: app.description,
    }
  }

  return { toCard }
}
