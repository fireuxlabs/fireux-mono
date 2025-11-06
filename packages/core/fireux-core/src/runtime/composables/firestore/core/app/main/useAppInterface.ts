// ~/composables/app/useAppInterface.ts
import type { Ref } from 'vue'
import type {
  App,
  AppCard,
  AppToPillMapper,
} from 'fireux-core/runtime/models/core/app.model.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolve = () => appRef?.value ?? null

  const mapToPill = (app?: App | null): AppCard.Pill => {
    const role = app?.role ?? ''
    const status = app?.status ?? ''
    const badges = [role, status].filter(Boolean)
    const title = app?.app_name ?? ''
    const initials = title.trim().charAt(0).toUpperCase() || 'A'

    return {
      id: app?.id ?? '',
      app_name: title,
      avatar_url: app?.avatar_url ?? '',
      ecosystem: app?.ecosystem ?? '',
      avatar: app?.avatar_url ?? '',
      initials,
      title,
      subtitle: app?.ecosystem ?? '',
      badges,
      to: app?.id ? `/apps/${app.id}` : '',
    }
  }

  const pillProps: AppToPillMapper = (app) => mapToPill(app)

  const toPill = (): Pill.Props => {
    const pill = mapToPill(resolve())
    return {
      avatar: pill.avatar,
      initials: pill.initials,
      title: pill.title,
      subtitle: pill.subtitle,
      badges: pill.badges,
      to: pill.to,
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

  return { toPill, pillProps, toCell, toProfile }
}
