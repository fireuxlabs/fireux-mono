// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import type {
  User,
  CoreUserDoc,
  AppUserDoc,
} from '../../../models/core/user.model'
import { useFirestoreUpdate } from '../useFirestoreUpdate'
import { useImageStorage } from '../../firebase/useImageStorage'

type TargetScope = 'auto' | 'core' | 'app'

export function useUserUpdate(userRef?: Ref<User | null>) {
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const getUid = () => userRef?.value?.id ?? authRef.value?.uid

  const targetFromScope = (scope: TargetScope) => {
    const id = getUid()
    if (!id) throw new Error('Not signed in and no userRef.id provided')

    if (scope === 'core') return { collection: 'core-users', id }
    if (scope === 'app') {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/users`, id }
    }

    // auto
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/users`, id }
    }
    return { collection: 'core-users', id }
  }

  /** low-level writer */
  type ScopePartialMap = {
    core: Partial<CoreUserDoc>
    app: Partial<AppUserDoc>
    auto: Partial<CoreUserDoc> | Partial<AppUserDoc>
  }

  const updateFieldsScoped = async <S extends TargetScope>(
    partial: ScopePartialMap[S],
    scope: S = 'auto' as S
  ) => {
    const { collection, id } = targetFromScope(scope)
    const isAppCollection = collection.startsWith('apps/')

    if (isAppCollection) {
      await updateDocument<AppUserDoc>(
        collection,
        id,
        partial as ScopePartialMap['app']
      )
      return
    }

    await updateDocument<CoreUserDoc>(
      collection,
      id,
      partial as ScopePartialMap['core']
    )
  }

  /** Field updaters (scoped) */
  const updateDisplayName = async (
    display_name: string,
    scope: TargetScope = 'auto'
  ) => updateFieldsScoped({ display_name }, scope)

  const updateHandle = async (handle: string, scope: TargetScope = 'auto') =>
    updateFieldsScoped({ handle }, scope)

  const updateAvatar = async (
    source: Blob | string,
    scope: TargetScope = 'auto'
  ) => {
    const { collection, id } = targetFromScope(scope)
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateFieldsScoped({ avatar: url }, scope)
    return url
  }

  return {
    // generic
    updateFields: updateFieldsScoped,

    // scoped helpers
    updateDisplayName,
    updateHandle,
    updateAvatar,
  }
}
