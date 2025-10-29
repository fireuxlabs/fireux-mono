import { computed, ref } from 'vue'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'

import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFetchUser } from 'fireux-core/runtime/composables/firestore/core/user/useFetchUser.ts'
import type { User, AppUser } from 'fireux-core/runtime/models/core/user.model.ts'

type AppUserWithCore = Partial<User> & { appUser: AppUser }

/**
 * Combined app users:
 *  - Fetches all /apps/{appId}/users (AppUser)
 *  - For each, fetches /core-users/{uid} (User)
 *  - Returns merged array: { ...coreUser, appUser }
 */
export function useAppUsers() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  if (!appId) {
    return { appUsers: ref<AppUserWithCore[]>([]) }
  }

  // Fetch all app users (overlays)
  const appOverlays = useCollection<AppUser>(
    collection(db, 'apps', appId, 'users') as any
  )

  // Lazy cache of core-user refs
  const coreCache: Record<string, ReturnType<typeof useFetchUser>['user']> = {}

  const getCoreRef = (uid: string) => {
    if (!coreCache[uid]) coreCache[uid] = useFetchUser(uid).user
    return coreCache[uid]
  }

  // Merged array
  const appUsers = computed<AppUserWithCore[]>(() =>
    (appOverlays.value ?? []).map((overlay) => {
      const core = getCoreRef(overlay.id).value ?? { id: overlay.id }
      return {
        ...(core as Partial<User>),
        appUser: overlay,
      }
    })
  )

  return { appUsers }
}