import { refreshNuxtData } from 'nuxt/app'
import type { WatchSource } from 'vue'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { useDishEditorScope } from './useDishEditorScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

/** Shared credential and stale-intent boundary for the three Dish commands. */
export function useDishMutation(ownerSources: WatchSource[] = []) {
  const { currentUser } = useAuth()
  const captureIntent = useDishEditorScope(ownerSources)
  async function mutate(
    method: 'POST' | 'PATCH' | 'DELETE',
    input: Record<string, unknown>,
    targetKitchenId: string,
    isOwnerCurrent?: () => boolean
  ) {
    const kitchenId = String(targetKitchenId || '').trim()
    if (!kitchenId) throw new Error('Kitchen id is required')
    const isCurrent = captureIntent(),
      uid = currentUser.value?.uid
    const body = JSON.parse(JSON.stringify({ ...input, kitchenId }))
    const assertScope = () => {
      if (
        !uid ||
        currentUser.value?.uid !== uid ||
        !isCurrent() ||
        (isOwnerCurrent && !isOwnerCurrent())
      )
        throw new Error(
          'The account or Kitchen changed. Reopen the Dish editor.'
        )
    }
    assertScope()
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid)
      throw new Error('The account changed. Reopen the Dish editor.')
    const token = await user.getIdToken()
    assertScope()
    const result = await $fetch<{ id: string }>(
      '/api/workspace/kitchen/dishes',
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
        method,
        headers: { Authorization: `Bearer ${token}` },
        body,
      }
    )
    if (
      typeof result?.id !== 'string' ||
      result.id !== result.id.trim() ||
      !isFirestoreDocumentId(result.id) ||
      (method !== 'POST' && result.id !== body.dishId)
    )
      throw new Error('Command response did not identify the requested record.')
    return result
  }
  return { mutate }
}
