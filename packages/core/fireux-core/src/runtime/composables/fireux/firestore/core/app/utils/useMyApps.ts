import { computed } from 'vue'
import { useUser } from '../../user/useUser'
import { useAppCollection } from '../fetch/useAppCollection'
import type { AppModel } from '../../../../../../models/core/app.model'

export function useMyApps() {
  const { coreUser } = useUser()
  const { apps } = useAppCollection()

  const appIds = computed(() =>
    Array.from(
      new Set(
        [
          ...(Array.isArray(coreUser.value?.userOf)
            ? coreUser.value.userOf
            : []),
          ...(Array.isArray(coreUser.value?.adminOf)
            ? coreUser.value.adminOf
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
  const myApps = computed<AppModel[]>(() => {
    if (!appIds.value.length) return []

    const ids = new Set(appIds.value)
    return (apps.value as AppModel[]).filter((app) =>
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
