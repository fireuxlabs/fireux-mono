import { computed, unref, type MaybeRef } from 'vue'
import { useUser } from '../../../../user/composables/useUser'
import { useFireUXConfig } from '../../config/FireUXConfig'
import type { App } from '../../../models/app.model'

export function useMyApps(
  apps: MaybeRef<App[] | null | undefined>
) {
  const { appUser } = useUserSession()
  const { appId } = useFireUXConfig()

  const appIds = computed(() =>
    Array.from(
      new Set(appUser.value ? [String(appId).trim()].filter(Boolean) : [])
    )
  )
  const myApps = computed<App[]>(() => {
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
