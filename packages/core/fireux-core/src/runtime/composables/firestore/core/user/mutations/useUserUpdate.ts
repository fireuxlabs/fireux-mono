import { computed } from 'vue'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from '../main/useUserFetch.ts'
import { useCoreUserUpdate } from './useCoreUserUpdate.ts'
import { useAppUserUpdate } from './useAppUserUpdate.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/core/config/FireUXConfig.ts'

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
