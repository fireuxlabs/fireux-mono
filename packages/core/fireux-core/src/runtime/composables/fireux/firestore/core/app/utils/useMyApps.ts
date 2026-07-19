import { computed, unref, type MaybeRef } from 'vue'
import { useUser } from '../../user/useUser'
import type { AppViewSource } from './view/useAppInterface'

export function useMyApps(
  apps: MaybeRef<AppViewSource[] | null | undefined>
) {
  const { coreUser } = useUser()

  const appIds = computed(() =>
    Array.from(
      new Set(
        [
          ...(Array.isArray(coreUser.value?.app_ids)
            ? coreUser.value.app_ids
            : []),
          ...(Array.isArray((coreUser.value as any)?.apps)
            ? (coreUser.value as any).apps
            : []),
        ]
          .map((id) => String(id ?? '').trim())
          .filter(Boolean)
      )
    )
  )
  const myApps = computed<AppViewSource[]>(() => {
    if (!appIds.value.length) return []

    const ids = new Set(appIds.value)
    return (unref(apps) ?? []).filter((app) =>
      ids.has(String(app.id ?? '').trim())
    )
  })
  const hasApps = computed(() => myApps.value.length > 0)

  return {
    appIds,
    myApps,
    hasApps,
  }
}
