import { computed } from 'vue'
import type {
  User,
  AppUser,
} from '../../../../../../models/core/user.model'
import type { UserRefs } from '../fetch/useUserFetch'
import { useCoreUserUpdate } from '../utils/update/useCoreUserUpdate'
import { useAppUserUpdate } from '../utils/update/useAppUserUpdate'
import { useFireUXConfig } from '../../../../app/FireUXConfig'

export function useUserUpdate(user: UserRefs, sourceLabel = 'unspecified') {
  const core = useCoreUserUpdate(user)
  const app = useAppUserUpdate(user)
  const cfg = useFireUXConfig()

  const coreId = user.coreUser?.value?.id ?? user.user?.value?.id ?? null
  const appId =
    user.appUser?.value?.id ??
    (cfg.isTenant ? cfg.appId : cfg.globalAppId) ??
    null

  const payload = {
    coreId,
    appId,
    source: sourceLabel,
  }

  if (!coreId || !appId) {
    console.warn('[useUserUpdate] context incomplete', payload)
  } else {
    console.info('[useUserUpdate] initialized', payload)
  }

  return {
    core,
    app,
    ...core,
    ...app,
  }
}

export function useUserUpdateForUid(uid: string) {
  const coreUser = computed<User | null>(
    () =>
      ({
        id: uid,
      } as User)
  )
  const appUser = computed<AppUser | null>(() => null)
  const user = computed<User | null>(() => coreUser.value)
  const pending = computed(() => false)

  return useUserUpdate(
    {
      user,
      coreUser,
      appUser,
      pending,
    } as UserRefs,
    'useUserUpdateForUid'
  )
}
