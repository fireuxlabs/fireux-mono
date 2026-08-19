// FILE: packages/core/fireux-core/src/runtime/composables/public/useSocialLinks.ts

type SocialPlatform =
  | 'website'
  | 'email'
  | 'twitter'
  | 'linkedin'
  | 'github'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | (string & {})

export type SocialLinks = Partial<Record<SocialPlatform, string>>

export type SocialLinkItem = {
  platform: string
  url: string
  icon: string
}

const ICONS: Record<string, string> = {
  website: 'heroicons:globe-alt',
  email: 'heroicons:envelope',
  twitter: 'simple-icons:x',
  linkedin: 'skill-icons:linkedin',
  github: 'skill-icons:github-dark',
  instagram: 'skill-icons:instagram',
  facebook: 'logos:facebook',
  tiktok: 'simple-icons:tiktok',
  youtube: 'logos:youtube-icon',
}

const BASE: Record<string, string> = {
  website: 'http://',
  email: 'mailto:',
  twitter: 'https://x.com/',
  linkedin: 'https://www.linkedin.com/',
  github: 'https://github.com/',
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  tiktok: 'https://tiktok.com/@',
  youtube: 'https://youtube.com/',
}

function toSocialUrl(platform: string, value: string): string {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return ''
  if (platform === 'email') {
    if (/^mailto:/i.test(trimmed)) return trimmed
    // Allow plain email values.
    if (/@/.test(trimmed) && !/^https?:\/\//i.test(trimmed))
      return `mailto:${trimmed}`
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const prefix = BASE[platform] || ''
  const suffix = trimmed.replace(/^\/+/, '')
  return `${prefix}${suffix}`
}

function iconForPlatform(platform: string): string {
  return ICONS[platform] || 'heroicons:link'
}

export function useSocialLinks() {
  function toItems(
    socialLinks: SocialLinks | null | undefined
  ): SocialLinkItem[] {
    const socials = socialLinks || {}
    return Object.entries(socials)
      .map(([platform, raw]) => {
        const url = toSocialUrl(platform, String(raw ?? ''))
        if (!url) return null
        return { platform, url, icon: iconForPlatform(platform) }
      })
      .filter((x): x is SocialLinkItem => Boolean(x))
  }

  return { toItems }
}
