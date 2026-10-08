import type { Place } from '../models/place.model'

export type PlaceContactLink = {
  label: string
  value: string
  to: string
  icon: string
  external: boolean
}

/** Only supported contact schemes become actionable public links. */
export function placeContactLinks(place: Partial<Place>): PlaceContactLink[] {
  const links: PlaceContactLink[] = []
  const phone = String(place.phone || '').trim()
  const number = phone.replace(/[ ()\-.]/g, '')
  if (/^\+?\d{5,20}$/.test(number))
    links.push({
      label: 'Phone',
      value: phone,
      to: `tel:${number}`,
      icon: 'i-lucide-phone',
      external: false,
    })
  const email = String(place.email || '').trim()
  if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))
    links.push({
      label: 'Email',
      value: email,
      to: `mailto:${encodeURIComponent(email)}`,
      icon: 'i-lucide-mail',
      external: false,
    })
  const platforms = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
  } as const
  for (const [key, label] of Object.entries(platforms)) {
    const raw = place.social_links?.[key as keyof typeof platforms]
    if (!raw) continue
    try {
      const url = new URL(raw)
      if (
        !['https:', 'http:'].includes(url.protocol) ||
        url.username ||
        url.password
      )
        continue
      links.push({
        label,
        value: label,
        to: url.href,
        icon: 'i-lucide-arrow-up-right',
        external: true,
      })
    } catch {
      /* Unusable historical links stay noninteractive. */
    }
  }
  return links
}
