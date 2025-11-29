import { computed, ref, unref, type MaybeRef } from 'vue'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUserFetch } from '../../user/main/useUserFetch.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

type AppUserWithCore = Partial<User> & { appUser: AppUser }

/**
 * Fetch /apps/{appId}/users and merge each overlay with its core user.
 */
export function useAppUsers(targetAppId?: MaybeRef<string | null | undefined>) {
  const db = useFirestore()
  const { appId: configAppId } = useFireUXConfig()
  const effectiveAppId = unref(targetAppId) ?? configAppId

  if (!effectiveAppId) {
    const overlays = ref<AppUser[]>([])
    const merged = computed<AppUserWithCore[]>(() => [])
    return { appUsers: merged, overlays }
  }

  const overlays = useCollection<AppUser>(
    collection(db, 'apps', effectiveAppId, 'users') as any
  )

  const cache: Record<string, ReturnType<typeof useUserFetch>> = {}
  const ensureUserRefs = (uid: string) => (cache[uid] ||= useUserFetch(uid))

  const merged = computed<AppUserWithCore[]>(() =>
    (overlays.value ?? []).map((overlay) => {
      const { coreUser } = ensureUserRefs(overlay.id)
      const core = (coreUser.value ?? undefined) as User | undefined

      if (core) {
        return {
          ...core,
          role: overlay.role ?? core.role,
          appUser: overlay,
        }
      }

      return {
        id: overlay.id,
        display_name: overlay.id,
        avatar: '',
        role: overlay.role,
        appUser: overlay,
      }
    })
  )

  return { appUsers: merged, overlays }
}
