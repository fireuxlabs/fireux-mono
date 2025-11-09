// FILE: ~/composables/app/useAppInterface.ts
import type { Ref } from 'vue'
import type { App, AppCard } from 'fireux-core/runtime/models/core/app.model.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'

const DEFAULT_INITIALS = 'A'

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

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const app = appRef?.value ?? null

  const pillProps = (target?: App | null): Pill.Props => {
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
    return {
      // Pill fields (since Cell extends Pill.Props)
      avatar: a?.avatar_url ?? '',
      initials: initialsFor(title),
      title,
      subtitle: a?.ecosystem ?? '',
      badges: [a?.role, a?.status].filter(Boolean) as string[],
      to: link,

      // App extras
      id: a?.id ?? '',
      app_name: title,
      role: a?.role ?? 'tenant',
      creator_id: a?.creator_id ?? '',
      admin_ids: a?.admin_ids ?? [],
      created_at: a?.created_at,
      avatar_url: a?.avatar_url ?? '',
      logo_url: a?.logo_url ?? '',
      wordmark_url: a?.wordmark_url ?? '',
    }
  }

  const profileProps = (target?: App | null): AppCard.Profile => ({
    ...cellProps(target),
  })

  return { pillProps, cellProps, profileProps }
}
