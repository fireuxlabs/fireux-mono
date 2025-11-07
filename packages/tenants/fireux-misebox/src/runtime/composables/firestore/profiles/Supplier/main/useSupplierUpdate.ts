import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreUpdate.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/firebase/useRequireUser.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { SupplierProfile } from '../../../../../models/profiles/Supplier.model.ts'

const COLLECTION = 'suppliers'

type TargetScope = 'auto' | 'core' | 'app'

export function useSupplierUpdate(_profile: ProfileRefs<SupplierProfile>) {
  const { updateDocument } = useFirestoreUpdate()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

  const resolveUid = async (explicitId?: string) => {
    if (explicitId) return explicitId
    const u = await useRequireUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  const resolveCollection = async (scope: TargetScope, explicitId?: string) => {
    const id = await resolveUid(explicitId)
    if (scope === 'core') {
      return { collection: COLLECTION, id }
    }
    if (scope === 'app') {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/${COLLECTION}`, id }
    }
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/${COLLECTION}`, id }
    }
    return { collection: COLLECTION, id }
  }

  const updateFields = async (
    partial: Record<string, unknown>,
    scope: TargetScope = 'auto',
    explicitId?: string
  ) => {
    const target = await resolveCollection(scope, explicitId)
    await updateDocument(target.collection, target.id, partial)
  }

  const updateDisplayName = (
    display_name: string,
    scope: TargetScope = 'auto',
    explicitId?: string
  ) => updateFields({ display_name }, scope, explicitId)

  const updateAvatar = (
    avatar: string,
    scope: TargetScope = 'auto',
    explicitId?: string
  ) => updateFields({ avatar }, scope, explicitId)

  return { updateFields, updateDisplayName, updateAvatar }
}
