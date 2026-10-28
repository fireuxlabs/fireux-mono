import { refreshNuxtData } from 'nuxt/app'
import { watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useState } from '#imports'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  readGuestKitchenClaim,
  clearGuestKitchenClaim,
} from '../../utils/guest-kitchen-claim'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

export function useKitchenAnonymousAdoption() {
  const { currentUser, isAuthenticated } = useAuth()
  const config = useFireUXConfig()
  const session = useAppSession()
  const captureIntent = useCommandScope([
    currentUser,
    session.appUser,
    session.pending,
    session.error,
    () => config.appId,
  ])
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

    const isCurrent = captureIntent()
    const appId = config.appId
    pending.value = true
    error.value = ''
    try {
      const token = await user.getIdToken()
      if (!isCurrent()) return false
      const result = await $fetch<{
        ok: true
        kitchen_id: string
        adopted: boolean
      }>('/api/kitchens/onboarding/adopt-anonymous', {
        onResponse: async ({ options, response }) => {
          if (
            response.ok &&
            !['GET', 'HEAD'].includes(
              String(options.method || 'GET').toUpperCase()
            )
          )
            await refreshNuxtData()
        },
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          kitchen_id: upgrade.kitchenId,
          claim_secret: upgrade.secret,
        },
      })
      if (
        result?.ok !== true ||
        result.kitchen_id !== upgrade.kitchenId ||
        typeof result.adopted !== 'boolean'
      )
        throw new Error('Kitchen adoption response was invalid.')
      // A confirmed commit consumes this exact recovery proof even if its UI owner changed.
      clearGuestKitchenClaim(appId, upgrade)
      if (!isCurrent()) return false
      adoptedSelection.value = upgrade.kitchenId
      return true
    } catch {
      if (isCurrent())
        error.value =
          'Your Kitchen could not be connected. Your saved Kitchen is unchanged.'
      return false
    } finally {
      pending.value = false
    }
  }

  if (import.meta.client)
    watch(
      [currentUser, session.appUser, session.pending, pending],
      (_next, previous) => {
        if (
          previous &&
          (previous[0] !== currentUser.value ||
            previous[1] !== session.appUser.value)
        )
          error.value = ''
        if (!error.value) void adopt()
      },
      { immediate: true }
    )
  return { adopt, pending, error }
}
