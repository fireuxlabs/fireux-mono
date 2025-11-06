// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserComputed.ts
import { computed } from 'vue'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'

export function useUserComputed(user: UserRefs) {
  const coreUser = user.coreUser as { value: User | null | undefined }
  const appUser = user.appUser as { value: AppUser | null | undefined }

  if (appUser.value) {
    // overlay merge hook reserved for future tenant overlays
  }

  const currentUser = computed(() => coreUser.value ?? null)
  const hasCoreProfile = computed(() => Boolean(coreUser.value))
  const hasAppProfile = computed(() => Boolean(appUser.value))
  const hasAnyProfile = computed(
    () => hasCoreProfile.value || hasAppProfile.value
  )

  return { currentUser, hasCoreProfile, hasAppProfile, hasAnyProfile }
}
