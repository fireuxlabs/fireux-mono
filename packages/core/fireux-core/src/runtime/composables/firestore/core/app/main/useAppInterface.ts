// FILE: ~/composables/app/useAppInterface.ts
import type { Ref } from 'vue'
import type { App, AppCard } from 'fireux-core/runtime/models/core/app.model.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const app = appRef?.value ?? null

  const pillProps = (target?: App | null): Pill.Props => {
    const a = target ?? app
    return {
      avatar: a?.avatar_url ?? '',
      initials: 'A',
      title: a?.app_name ?? '',
      subtitle: a?.ecosystem ?? '',
      badges: [a?.role, a?.status].filter(Boolean) as string[],
      to: a?.id ? `/apps/${a.id}` : null,
    }
  }

  const cellProps = (target?: App | null): AppCard.Cell => {
    const a = target ?? app
    const title = a?.app_name ?? ''
    return {
      // Pill fields (since Cell extends Pill.Props)
      avatar: a?.avatar_url ?? '',
      initials: 'A',
      title,
      subtitle: a?.ecosystem ?? '',
      badges: [a?.role, a?.status].filter(Boolean) as string[],
      to: a?.id ? `/apps/${a.id}` : '',

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
