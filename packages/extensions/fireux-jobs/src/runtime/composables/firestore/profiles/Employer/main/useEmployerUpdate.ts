import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreUpdate.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/firebase/useRequireUser.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { EmployerProfile } from '../../../../../models/profiles/Employer.model.ts'

// Note: All helpers are auto-imported at runtime by the Nuxt module, but we import explicitly for type safety.

const COLLECTION = 'employers'

type TargetScope = 'auto' | 'core' | 'app'
type UpdateResult = 'success'

export function useEmployerUpdate(_profile: ProfileRefs<EmployerProfile>) {
  const { updateDocument } = useFirestoreUpdate()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId
  const { uploadImage } = useImageStorage()

  const sanitizePartial = (partial: Record<string, unknown>) => {
    const next = { ...partial }
    delete next.uid
    delete next.created_at
    delete next.updated_at
    return next
  }

  const resolveUid = async (explicitId?: string) => {
    if (explicitId) return explicitId
    const u = await useRequireUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  const resolveTarget = async (scope: TargetScope, explicitId?: string) => {
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
  ): Promise<UpdateResult> => {
    const target = await resolveTarget(scope, explicitId)
    await updateDocument(target.collection, target.id, sanitizePartial(partial))
    return 'success'
  }

  const updateCore = (
    partial: Record<string, unknown>,
    explicitId?: string
  ): Promise<UpdateResult> => updateFields(partial, 'core', explicitId)

  const updateApp = (
    partial: Record<string, unknown>,
    explicitId?: string
  ): Promise<UpdateResult> => updateFields(partial, 'app', explicitId)

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

  return {
    updateFields,
    updateCore,
    updateApp,
    updateDisplayName,
    updateAvatar,
  }
}
