import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreUpdate.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/firebase/useRequireUser.ts'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { ChefProfile } from '../../../../../models/profiles/Chef.model.ts'

const COLLECTION = 'chefs'

type TargetScope = 'auto' | 'core' | 'app'

export function useChefUpdate(_profile: ProfileRefs<ChefProfile>) {
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

  const resolveUid = async (explicitId?: string) => {
    if (explicitId) return explicitId
    const u = await useRequireUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  const resolveTarget = async (scope: TargetScope, explicitId?: string) => {
    const id = await resolveUid(explicitId)
    if (scope === 'app') {
      if (!appId) throw new Error('Missing appId for tenant-scoped chef update')
      return { collection: `apps/${appId}/${COLLECTION}`, id }
    }
    if (scope === 'core') {
      return { collection: COLLECTION, id }
    }
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped chef update')
      return { collection: `apps/${appId}/${COLLECTION}`, id }
    }
    return { collection: COLLECTION, id }
  }

  const updateFields = async (
    partial: Record<string, unknown>,
    scope: TargetScope = 'auto',
    explicitId?: string
  ) => {
    const target = await resolveTarget(scope, explicitId)
    await updateDocument(target.collection, target.id, partial)
  }

  const updateDisplayName = (
    display_name: string,
    scope: TargetScope = 'auto',
    explicitId?: string
  ) => updateFields({ display_name }, scope, explicitId)

  const updateAvatar = async (
    source: Blob | string,
    scope: TargetScope = 'auto',
    explicitId?: string
  ) => {
    const target = await resolveTarget(scope, explicitId)
    const path = `${target.collection}/${target.id}/avatar`
    const url = await uploadImage(path, source)
    await updateDocument(target.collection, target.id, { avatar: url })
    return url
  }

  return { updateFields, updateDisplayName, updateAvatar }
}
