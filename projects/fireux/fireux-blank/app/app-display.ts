import { APP_ROLES, APP_STATUSES, type App } from 'fireux-core/app'

export type AppSummary = Pick<App, 'id' | 'name' | 'tagline'> &
  Partial<Pick<App, 'role' | 'status'>>

export type AppDetailDisplay = AppSummary & Pick<App, 'description'> & {
  logoUrl?: string
  coverUrl?: string
  links: { label: string; to: string }[]
}

function displayText(value: unknown): string | undefined {
  return typeof value === 'string' ? value.trim() || undefined : undefined
}

function webUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return
  try {
    const url = new URL(value)
    if ((url.protocol === 'https:' || url.protocol === 'http:') &&
      !url.username && !url.password) return url.href
  } catch {
    return undefined
  }
}

export function readAppSummary(id: App['id'], data: Record<string, unknown>): AppSummary | null {
  const name = displayText(data.name)
  if (!name) return null

  return {
    id,
    name,
    tagline: displayText(data.tagline),
    role: APP_ROLES.find(role => role === data.role),
    status: APP_STATUSES.find(status => status === data.status),
  }
}

const socialLabels = {
  website: 'Website',
  twitter: 'X',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  email: 'Email',
} satisfies Record<keyof NonNullable<App['social_links']>, string>

export function readAppDetail(id: App['id'], data: Record<string, unknown>): AppDetailDisplay | null {
  const summary = readAppSummary(id, data)
  if (!summary) return null

  const { media, social_links: socials } = data
  const links: AppDetailDisplay['links'] = []
  if (socials && typeof socials === 'object') {
    for (const [key, label] of Object.entries(socialLabels)) {
      const value = (socials as Record<string, unknown>)[key]
      if (key === 'email') {
        if (typeof value !== 'string') continue
        const email = value.trim().replace(/^mailto:/i, '')
        if (/^[\w.+-]+@[\w.-]+\.[a-z]+$/i.test(email)) {
          links.push({ label, to: `mailto:${email}` })
        }
        continue
      }

      const to = webUrl(value)
      if (to) links.push({ label, to })
    }
  }

  return {
    ...summary,
    description: displayText(data.description),
    logoUrl: media && typeof media === 'object' && 'logo_url' in media ? webUrl(media.logo_url) : undefined,
    coverUrl: media && typeof media === 'object' && 'cover_url' in media ? webUrl(media.cover_url) : undefined,
    links,
  }
}
