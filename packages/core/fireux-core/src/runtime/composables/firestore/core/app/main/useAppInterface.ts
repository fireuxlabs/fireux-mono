// FILE: ~/composables/app/useAppInterface.ts
import type { Ref } from 'vue'
import type { App, AppCard } from 'fireux-core/runtime/models/core/app.model.ts'

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const current = appRef?.value ?? null

  const toPath = (id?: string | null) => (id ? `/apps/${id}` : '')

  const uniqueStrings = (arr?: Array<string | null | undefined>) =>
    Array.isArray(arr)
      ? [
          ...new Set(
            arr
              .map((value) => (value ?? '').trim())
              .filter((value): value is string => value.length > 0)
          ),
        ]
      : []

  const sanitizeLinks = (links?: App['social_links']) => {
    if (!links) return undefined
    const clean = Object.entries(links).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (typeof value === 'string') {
          const trimmed = value.trim()
          if (trimmed) acc[key] = trimmed
        }
        return acc
      },
      {}
    )
    return Object.keys(clean).length
      ? (clean as App['social_links'])
      : undefined
  }

  const pillProps = (target?: App | null): AppCard.Pill => {
    const app = target ?? current
    return {
      avatar: app?.avatar_url ?? '',
      title: app?.app_name ?? '',
      subtitle: app?.ecosystem ?? '',
      badges: [app?.role, app?.status].filter(Boolean) as string[],
      to: toPath(app?.id) || null,
    }
  }

  const cellProps = (target?: App | null): AppCard.Cell => {
    const app = target ?? current
    const admins = uniqueStrings(app?.admin_ids)
    return {
      ...pillProps(app),
      to: toPath(app?.id),
      id: app?.id ?? '',
      app_name: app?.app_name ?? '',
      role: app?.role ?? 'tenant',
      creator_id: app?.creator_id ?? '',
      admin_ids: admins,
      created_at: app?.created_at,
      avatar_url: app?.avatar_url ?? '',
      logo_url: app?.logo_url ?? '',
      wordmark_url: app?.wordmark_url ?? '',
      ecosystem: app?.ecosystem ?? undefined,
    }
  }

  const profileProps = (target?: App | null): AppCard.Profile => {
    const app = target ?? current
    const cell = cellProps(app)
    const joins = uniqueStrings(app?.join_requests)

    return {
      ...cell,
      app_short_name: app?.app_short_name ?? null,
      slug: app?.slug ?? null,
      description: app?.description ?? null,
      status: app?.status ?? null,
      social_links: sanitizeLinks(app?.social_links),
      join_requests: joins,
      joinRequestCount: joins.length,
      adminCount: cell.admin_ids?.length ?? 0,
      updated_at: app?.updated_at,
    }
  }

  return { pillProps, cellProps, profileProps }
}
