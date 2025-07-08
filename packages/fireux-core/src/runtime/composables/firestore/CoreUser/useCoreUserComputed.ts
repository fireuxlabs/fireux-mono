// ~/composables/firestore/CoreUser/useCoreUserComputed.ts
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { CoreUser } from '../../../models/coreUser.model'

export function useCoreUserComputed(
  coreUser: Ref<CoreUser | null | undefined>
) {
  // Computed properties
  const isCoreUser = computed(() => !!coreUser.value)
  const hasAvatar = computed(() => !!coreUser.value?.avatar)
  const userOfApps = computed(() => coreUser.value?.userOf?.length ?? 0)
  const hasMultipleApps = computed(() => userOfApps.value > 1)

  return {
    // Computed properties
    isCoreUser,
    hasAvatar,
    userOfApps,
    hasMultipleApps,
  }
}
