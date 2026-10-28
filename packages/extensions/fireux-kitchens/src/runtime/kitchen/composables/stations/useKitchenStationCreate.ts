import { refreshNuxtData } from 'nuxt/app'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

type CreateKitchenStationInput = {
  kitchenId: string
  name: string
  sortOrder?: number
}

export function useKitchenStationCreate() {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(appUser.value),
  ])
  const createKitchenStation = async (input: CreateKitchenStationInput) => {
    const body = { ...input }
    const isCurrent = captureIntent()
    const uid = currentUser.value?.uid
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || !isCurrent())
        throw new Error(
          'The account or Kitchen changed. Try adding the Station again.'
        )
    }
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid)
      throw new Error('The account changed. Try adding the Station again.')
    const token = await user.getIdToken()
    assertScope()
    const result = await $fetch<{ id: string }>(
      '/api/workspace/kitchen/stations',
      {
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
        body,
      }
    )
    if (!result?.id)
      throw new Error('Station response did not identify the created record.')
    return result.id
  }
  async function ensureDefaultStation(kitchenId: string) {
    const user = currentUser.value
    if (!user || user.isAnonymous || !kitchenId)
      throw new Error(
        'Sign in and choose a Kitchen before adding the Pass station.'
      )
    const token = await user.getIdToken()
    if (currentUser.value?.uid !== user.uid)
      throw new Error('The signed-in account changed.')
    await $fetch('/api/workspace/kitchen/stations/ensure-default', {
      onResponse: async ({ response }) => {
        if (response.ok) await refreshNuxtData()
      },
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId },
      retry: 0,
    })
  }
  return { createKitchenStation, ensureDefaultStation }
}
