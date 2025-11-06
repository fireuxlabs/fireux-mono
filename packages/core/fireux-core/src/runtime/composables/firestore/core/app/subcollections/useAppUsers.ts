import { computed, ref } from 'vue'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUserFetch } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserFetch.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

type AppUserWithCore = Partial<User> & { appUser: AppUser }

/**
 * Fetch /apps/{appId}/users and merge each overlay with its core user.
 */
export function useAppUsers() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  if (!appId) return { appUsers: ref<AppUserWithCore[]>([]) }

  const overlays = useCollection<AppUser>(
    collection(db, 'apps', appId, 'users') as any
  )

  const cache: Record<string, ReturnType<typeof useUserFetch>['user']> = {}
  const ensureUserRefs = (uid: string) =>
    (cache[uid] ||= useUserFetch(uid).user)

  const appUsers = computed<AppUserWithCore[]>(() =>
    (overlays.value ?? []).map((overlay) => {
      const { coreUser } = ensureUserRefs(overlay.id)
      const core = coreUser?.value as User | undefined

      return {
        ...(core ?? { id: overlay.id }),
        appUser: overlay,
      }
    })
  )

  return { appUsers }
}
