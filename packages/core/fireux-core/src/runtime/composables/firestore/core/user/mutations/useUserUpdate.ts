import { computed } from 'vue'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from '../main/useUserFetch.ts'
import { useCoreUserUpdate } from './useCoreUserUpdate.ts'
import { useAppUserUpdate } from './useAppUserUpdate.ts'

export function useUserUpdate(user: UserRefs, sourceLabel = 'unspecified') {
  const core = useCoreUserUpdate(user)
  const app = useAppUserUpdate(user)

  const coreId =
    user.coreUser?.value?.id ?? user.user?.value?.id ?? 'unknown-core'
  const appId = user.appUser?.value?.id ?? 'unknown-app'

  console.info('[useUserUpdate] initialized', {
    coreId,
    appId,
    source: sourceLabel,
  })

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
