// FILE: ~/composables/app/useAppInterface.ts
import type { Ref } from 'vue'
import type { App, AppCard } from 'fireux-core/runtime/models/core/app.model.ts'

const DEFAULT_INITIALS = 'A'
type SocialLinks = NonNullable<App['social_links']>

const initialsFor = (name?: string | null): string => {
  const trimmed = (name ?? '').trim()
  if (!trimmed) return DEFAULT_INITIALS

  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() || DEFAULT_INITIALS
  }

  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.at(-1)?.charAt(0) ?? ''

  return (first + last).toUpperCase().slice(0, 2)
}

const toUniqueStrings = (
  input?: Array<string | null | undefined>
): string[] => {
  if (!Array.isArray(input) || input.length === 0) return []

  const trimmed = input
    .map((value) => (value ?? '').trim())
    .filter((value): value is string => value.length > 0)

  return trimmed.length ? Array.from(new Set(trimmed)) : []
}

const sanitizeSocialLinks = (
  links?: App['social_links']
): App['social_links'] | undefined => {
  if (!links) return undefined

  const result: SocialLinks = {}
  let hasValue = false

  for (const [key, raw] of Object.entries(links)) {
    const value = typeof raw === 'string' ? raw.trim() : ''
    if (!value) continue
    result[key as keyof SocialLinks] = value
    hasValue = true
  }

  return hasValue ? result : undefined
}

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const app = appRef?.value ?? null

  const pillProps = (target?: App | null): AppCard.Pill => {
    const a = target ?? app
    const title = a?.app_name ?? ''
    const link = a?.id ? `/apps/${a.id}` : ''
    return {
      avatar: a?.avatar_url ?? '',
      initials: initialsFor(title),
      title,
      subtitle: a?.ecosystem ?? '',
      badges: [a?.role, a?.status].filter(Boolean) as string[],
      to: link || null,
    }
  }

  const cellProps = (target?: App | null): AppCard.Cell => {
    const a = target ?? app
    const title = a?.app_name ?? ''
    const link = a?.id ? `/apps/${a.id}` : ''
    const base = pillProps(target)
    const admins = toUniqueStrings(a?.admin_ids)
    return {
      ...base,
      to: link,
      id: a?.id ?? '',
      app_name: title,
      role: a?.role ?? 'tenant',
      creator_id: a?.creator_id ?? '',
      admin_ids: admins,
      created_at: a?.created_at,
      avatar_url: a?.avatar_url ?? '',
      logo_url: a?.logo_url ?? '',
      wordmark_url: a?.wordmark_url ?? '',
      ecosystem: a?.ecosystem ?? undefined,
    }
  }

  const profileProps = (target?: App | null): AppCard.Profile => {
    const a = target ?? app
    const cell = cellProps(target)
    const joinRequests = toUniqueStrings(a?.join_requests)

    return {
      ...cell,
      app_short_name: a?.app_short_name ?? null,
      slug: a?.slug ?? null,
      description: a?.description ?? null,
      status: a?.status ?? null,
      social_links: sanitizeSocialLinks(a?.social_links),
      join_requests: joinRequests,
      joinRequestCount: joinRequests.length,
      adminCount: cell.admin_ids?.length ?? 0,
      updated_at: a?.updated_at,
    }
  }

  return { pillProps, cellProps, profileProps }
}
