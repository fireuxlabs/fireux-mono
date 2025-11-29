import { computed } from 'vue'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from '../main/useUserFetch.ts'
import { useCoreUserUpdate } from './useCoreUserUpdate.ts'
import { useAppUserUpdate } from './useAppUserUpdate.ts'

export function useUserUpdate(user: UserRefs) {
  const core = useCoreUserUpdate(user)
  const app = useAppUserUpdate(user)

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

  return useUserUpdate({
    user,
    coreUser,
    appUser,
    pending,
  } as UserRefs)
}
