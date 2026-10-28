import { refreshNuxtData } from 'nuxt/app'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { PropertyIdentityUpdateInput } from '../models/property.model'

export function usePropertyIdentityUpdate() {
  const { currentUser } = useAuth()
  async function updateIdentity(input: {
    propertyId: string
    changes: PropertyIdentityUpdateInput
  }) {
    const body = JSON.parse(JSON.stringify(input)) as typeof input
    const user = currentUser.value
    if (!body.propertyId || !user || user.isAnonymous)
      throw new Error('Sign in and choose a Property before editing Identity.')
    const token = await user.getIdToken()
    if (currentUser.value?.uid !== user.uid)
      throw new Error('The signed-in account changed.')
    const result = await $fetch<{ ok: true; propertyId: string }>(
      '/api/workspace/property/identity',
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
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body,
        retry: 0,
      }
    )
    if (result?.ok !== true || result.propertyId !== body.propertyId)
      throw new Error(
        'Property identity response did not match the requested Property.'
      )
  }
  return { updateIdentity }
}
