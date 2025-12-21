import type { Ref } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'
import type { Pill as PillModel } from '../../../../../../../types/pill.model'

export namespace AppCard {
  /** Single payload powering Pill/Cell/Profile views */
  export interface Card extends PillModel.Props {
    to: string | null
    id?: string
    app_name: string
    role: App['role']
    creator_id: string
    admin_ids?: string[]
    created_at?: App['created_at']
    avatar_url?: string | null
    logo_url?: string | null
    wordmark_url?: string | null
    ecosystem?: string
    app_short_name?: string | null
    slug?: string | null
    description?: string | null
    status?: App['status'] | null
    social_links?: App['social_links']
    join_requests?: string[]
    joinRequestCount?: number
    adminCount?: number
    updated_at?: App['updated_at']
  }
}

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolveApp = (target?: App | null) => target ?? appRef?.value ?? null

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

  const cardProps = (target?: App | null): AppCard.Card => {
    const app = resolveApp(target)
    const to = toPath(app?.id) || null
    const admins = uniqueStrings(app?.admin_ids)
    const joins = uniqueStrings(app?.join_requests)

    return {
      avatar: app?.avatar_url ?? null,
      title: app?.app_name ?? '',
      subtitle: app?.ecosystem ?? '',
      badges: [app?.role, app?.status].filter(Boolean) as string[],
      to,
      id: app?.id ?? undefined,
      app_name: app?.app_name ?? '',
      role: app?.role ?? 'tenant',
      creator_id: app?.creator_id ?? '',
      admin_ids: admins,
      created_at: app?.created_at,
      avatar_url: app?.avatar_url ?? null,
      logo_url: app?.logo_url ?? null,
      wordmark_url: app?.wordmark_url ?? null,
      ecosystem: app?.ecosystem ?? undefined,
      app_short_name: app?.app_short_name ?? null,
      slug: app?.slug ?? null,
      description: app?.description ?? null,
      status: app?.status ?? null,
      social_links: sanitizeLinks(app?.social_links),
      join_requests: joins,
      joinRequestCount: joins.length,
      adminCount: admins.length,
      updated_at: app?.updated_at,
    }
  }

  const pillProps = (target?: App | null): AppCard.Card => cardProps(target)
  const cellProps = (target?: App | null): AppCard.Card => cardProps(target)
  const profileProps = (target?: App | null): AppCard.Card => cardProps(target)

  return { cardProps, pillProps, cellProps, profileProps }
}
