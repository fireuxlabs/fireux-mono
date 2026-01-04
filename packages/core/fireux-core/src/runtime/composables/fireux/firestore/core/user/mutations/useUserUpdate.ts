import type { UserRefs } from '../fetch/useUserFetch'
import { useCoreUserUpdate } from '../utils/update/useCoreUserUpdate'
import { useAppUserUpdate } from '../utils/update/useAppUserUpdate'
import { useFireUXConfig } from '../../../../app/FireUXConfig'

const loggedInitKeys = new Set<string>()

export function useUserUpdate(user: UserRefs, sourceLabel = 'unspecified') {
  const core = useCoreUserUpdate(user)
  const app = useAppUserUpdate(user)
  const cfg = useFireUXConfig()

  // Canon: both docs use the SAME uid as their document id
  const coreUid = user.coreUser?.value?.id ?? user.user?.value?.id ?? null

  // NOTE: appUser.id is ALSO uid (NOT appId)
  const appUserUid = user.appUser?.value?.id ?? null

  const activeAppId = cfg.isTenant ? cfg.appId : cfg.globalAppId

  if (cfg.devMode) {
    if (coreUid && appUserUid && coreUid !== appUserUid) {
      throw new Error(
        `[useUserUpdate] core uid (${coreUid}) != appUser uid (${appUserUid}); source=${sourceLabel}`
      )
    }
  }

  // During initial boot it is normal for user/app context to be unavailable.
  // Only log once when fully initialized, and only in dev.
  if (cfg.devMode && coreUid && activeAppId) {
    const key = `${sourceLabel}:${coreUid}:${activeAppId}`
    if (!loggedInitKeys.has(key)) {
      loggedInitKeys.add(key)
      console.info('[useUserUpdate] initialized', {
        uid: coreUid,
        appId: activeAppId,
        source: sourceLabel,
      })
    }
  }

  return {
    core,
    app,
  }
}
