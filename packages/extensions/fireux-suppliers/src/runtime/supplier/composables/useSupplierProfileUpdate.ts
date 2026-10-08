import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { PlaceUpdateAdapter } from 'fireux-places/runtime/place/composables/firestore/mutations/usePlaceUpdate'
import type { SupplierIdentityState } from './useSupplierIdentity'

export function useSupplierProfileUpdate(
  identity: SupplierIdentityState
): PlaceUpdateAdapter {
  const { currentUser } = useAuth(),
    session = useAppSession(),
    config = useFireUXConfig(),
    route = useRoute()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    session.appUser,
    () => config.appId,
    () => route.fullPath,
    identity.supplierId,
    identity.companyId,
    identity.canWrite,
  ])
  const update: PlaceUpdateAdapter['update'] = async (placeId, patch) => {
    const body = JSON.parse(
      JSON.stringify({ supplierId: identity.supplierId.value, placeId, patch })
    )
    const uid = currentUser.value?.uid,
      isCurrent = captureIntent()
    const assertCurrent = () => {
      if (
        !uid ||
        !isCurrent() ||
        !identity.canWrite.value ||
        identity.companyId.value !== placeId
      )
        throw new Error('The account or Supplier changed. Reopen Identity.')
    }
    assertCurrent()
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account changed. Reopen Identity.')
    const token = await user.getIdToken()
    assertCurrent()
    const result = await $fetch<{
      ok: true
      supplierId: string
      place: import('fireux-places/runtime/place/models/place.model').Place
    }>('/api/workspace/supplier/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
    if (
      result?.ok !== true ||
      result.supplierId !== body.supplierId ||
      result.place?.id !== placeId
    )
      throw new Error(
        'Supplier profile response did not match the requested business.'
      )
    return result.place
  }
  return { update, captureIntent }
}
