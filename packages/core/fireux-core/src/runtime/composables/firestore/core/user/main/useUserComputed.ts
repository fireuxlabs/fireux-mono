// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserComputed.ts
import { computed } from 'vue'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'

export function useUserComputed(user: UserRefs) {
  const core = user.coreUser as { value: User | undefined }

  const app = user.appUser as { value: AppUser | undefined } // its ok
  if (app.value) {
    // overlay merge hook reserved for future tenant overlays
  }

  const pill = computed(() => ({
    avatar: core.value?.avatar || '',
    title: core.value?.display_name || '',
    subtitle: core.value?.handle || '',
    to: core.value?.id ? `/users/${core.value.id}` : '#',
  }))

  return { pill }
}
