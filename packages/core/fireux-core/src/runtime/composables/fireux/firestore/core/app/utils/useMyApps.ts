import { computed, unref, type MaybeRef } from 'vue'
import { useUser } from '../../user/useUser'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import type { AppViewSource } from './view/useAppInterface'

export function useMyApps(
  apps: MaybeRef<AppViewSource[] | null | undefined>
) {
  const { appUser } = useUser()
  const { appId } = useFireUXConfig()

  const appIds = computed(() =>
    Array.from(
      new Set(appUser.value ? [String(appId).trim()].filter(Boolean) : [])
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
