import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { PropertyIdentityState } from './usePropertyIdentity'
import type { PropertyIdentityUpdateInput } from '../models/property.model'

export function usePropertyIdentityUpdate(identity: PropertyIdentityState) {
  const { currentUser } = useAuth(),
    session = useAppSession(),
    config = useFireUXConfig(),
    route = useRoute()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    session.appUser,
    () => config.appId,
    () => route.fullPath,
    identity.propertyId,
    identity.canWrite,
  ])
  async function updateIdentity(changes: PropertyIdentityUpdateInput) {
    const body = JSON.parse(
      JSON.stringify({ propertyId: identity.propertyId.value, changes })
    )
    const uid = currentUser.value?.uid,
      isCurrent = captureIntent()
    const assertCurrent = () => {
      if (!uid || !isCurrent() || !identity.canWrite.value)
        throw new Error('The account or Property changed. Reopen Identity.')
    }
    assertCurrent()
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account changed. Reopen Identity.')
    const token = await user.getIdToken()
    assertCurrent()
    const result = await $fetch<{ ok: true; propertyId: string }>(
      '/api/workspace/property/identity',
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body }
    )
    if (result?.ok !== true || result.propertyId !== body.propertyId)
      throw new Error(
        'Property identity response did not match the requested Property.'
      )
  }
  return { updateIdentity, captureIntent }
}
