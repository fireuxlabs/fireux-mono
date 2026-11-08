import { refreshNuxtData } from 'nuxt/app'
// Concurrent edit — 2026-07-21 14:08 CEST — Werkbox Firebase hardening: route Business materialization through its authenticated server boundary.
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

export function useBusinessCreate() {
  const { currentUser } = useAuth(),
    config = useFireUXConfig(),
    route = useRoute()
  const { appUser, appUserPending, appUserError, appUserOutcome } =
    useUserSession()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    () => config.appId,
    appUser,
    appUserPending,
    appUserError,
    appUserOutcome,
    () => route.fullPath,
  ])
  async function createBusiness(input: { id: string }): Promise<string> {
    if (!input?.id) {
      throw new Error('Business id is required')
    }

    const id = String(input.id).trim()
    const uid = currentUser.value?.uid,
      isCurrent = captureIntent()
    const assertCurrent = () => {
      if (!uid || !isCurrent())
        throw new Error(
          'The account, App or page changed. Reopen Business creation.'
        )
    }
    assertCurrent()
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account changed. Reopen Business creation.')
    const token = await user.getIdToken()
    assertCurrent()
    const result = await $fetch<{ ok: boolean; id: string; created: boolean }>(
      '/api/businesses/materialize',
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
        body: { id },
      }
    )
    if (
      result?.ok !== true ||
      result.id !== id ||
      typeof result.created !== 'boolean'
    ) {
      throw new Error(
        '[useBusinessCreate] Business materialization response was invalid.'
      )
    }

    return id
  }

  return { createBusiness, captureIntent }
}
