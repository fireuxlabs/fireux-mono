import { watch } from 'vue'
import { useState } from '#imports'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  readGuestKitchenClaim,
  clearGuestKitchenClaim,
} from '../../../utils/guest-kitchen-claim'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

export function useKitchenAnonymousAdoption() {
  const { currentUser, isAuthenticated } = useAuth()
  const config = useFireUXConfig()
  const session = useAppSession()
  const adoptedSelection = useState(
    `kitchen-adopted-selection:${config.appId}`,
    () => ''
  )
  const pending = useState(
    `kitchen-adoption-pending:${config.appId}`,
    () => false
  )
  const error = useState(`kitchen-adoption-error:${config.appId}`, () => '')

  const adopt = async () => {
    const upgrade = readGuestKitchenClaim(config.appId)
    const user = currentUser.value
    if (
      pending.value ||
      session.pending.value ||
      session.error.value ||
      !session.appUser.value ||
      !upgrade ||
      !isAuthenticated.value ||
      !user ||
      session.uid.value !== user.uid
    )
      return false

    pending.value = true
    error.value = ''
    try {
      const token = await user.getIdToken()
      await $fetch('/api/kitchens/onboarding/adopt-anonymous', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          kitchen_id: upgrade.kitchenId,
          claim_secret: upgrade.secret,
        },
      })
      if (currentUser.value?.uid !== user.uid) return false
      adoptedSelection.value = upgrade.kitchenId
      clearGuestKitchenClaim(config.appId, upgrade)
      return true
    } catch (cause) {
      error.value =
        'Your Kitchen could not be connected. Your saved Kitchen is unchanged.'
      return false
    } finally {
      pending.value = false
    }
  }

  if (import.meta.client)
    watch(
      [currentUser, session.appUser, session.pending],
      () => {
        if (!error.value) void adopt()
      },
      { immediate: true }
    )
  return { adopt, pending, error }
}
