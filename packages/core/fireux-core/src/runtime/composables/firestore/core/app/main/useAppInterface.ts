// ~/composables/app/useAppInterface.ts
import type { Ref } from 'vue'
import type { App, AppCard } from 'fireux-core/runtime/models/core/app.model.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolve = () => appRef?.value ?? null

  const toPill = (): Pill.Props => {
    const app = resolve()
    const role = app?.role ?? ''
    const status = app?.status ?? ''
    const badges = [role, status].filter(Boolean)

    return {
      avatar: app?.avatar_url ?? '',
      initials: 'A',
      title: app?.app_name ?? '',
      subtitle: app?.ecosystem ?? '',
      badges,
      to: app?.id ? `/apps/${app.id}` : '',
    }
  }

  const toCell = (): AppCard.Cell & { to?: string } => {
    const app = resolve()
    return {
      id: app?.id ?? '',
      app_name: app?.app_name ?? '',
      role: app?.role ?? 'tenant',
      creator_id: app?.creator_id ?? '',
      admin_ids: app?.admin_ids ?? [],
      created_at: app?.created_at,
      avatar_url: app?.avatar_url ?? '',
      logo_url: app?.logo_url ?? '',
      wordmark_url: app?.wordmark_url ?? '',
      to: app?.id ? `/apps/${app.id}` : '',
    }
  }

  const toProfile = (): AppCard.Profile & { to?: string } => ({
    ...toCell(),
  })

  return { toPill, toCell, toProfile }
}
