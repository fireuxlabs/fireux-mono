import { ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  clearPendingAnonymousAccountUpgrade,
  readPendingAnonymousAccountUpgrade,
} from 'fireux-core/runtime/composables/fireux/firebase/anonymous-account-upgrade'

export function useKitchenAnonymousAdoption() {
  const { currentUser, isAuthenticated } = useAuth()
  const pending = ref(false)
  const error = ref<unknown>()

  const adopt = async () => {
    const upgrade = readPendingAnonymousAccountUpgrade()
    const user = currentUser.value
    if (
      !upgrade ||
      upgrade.family !== 'kitchen' ||
      !upgrade.targetId ||
      !isAuthenticated.value ||
      !user
    )
      return false

    pending.value = true
    error.value = undefined
    try {
      const token = await user.getIdToken()
      await $fetch('/api/kitchens/onboarding/adopt-anonymous', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          kitchen_id: upgrade.targetId,
          anonymous_token: upgrade.idToken,
        },
      })
      clearPendingAnonymousAccountUpgrade()
      return true
    } catch (cause) {
      error.value = cause
      return false
    } finally {
      pending.value = false
    }
  }

  return { adopt, pending, error }
}
