// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUserUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreUpdate } from '../../operations/useFirestoreUpdate.ts'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage.ts'
import type { User } from './useUser.ts'

type TargetScope = 'auto' | 'core' | 'app'

export function useUserUpdate(userRef?: Ref<User | null>) {
  const authRef = useCurrentUser()
  const { isTenant, appId } = useFireUXConfig()
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const getUid = () => userRef?.value?.id ?? authRef.value?.uid

  const targetFromScope = (scope: TargetScope) => {
    const id = getUid()
    if (!id) throw new Error('Not signed in and no userRef.id provided')

    if (scope === 'core') return { collection: 'users', id }
    if (scope === 'app') {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/users`, id }
    }

    // auto
    if (isTenant) {
      return { collection: `apps/${appId}/users`, id }
    }
    return { collection: 'users', id }
  }

  const updateFieldsScoped = async <S extends TargetScope>(
    partial: Record<string, any>,
    scope: S = 'auto' as S
  ) => {
    const { collection, id } = targetFromScope(scope)
    await updateDocument(collection, id, partial)
  }

  const updateDisplayName = async (
    display_name: string,
    scope: TargetScope = 'auto'
  ) => updateFieldsScoped({ display_name }, scope)

  const updateHandle = async (handle: string, scope: TargetScope = 'auto') =>
    updateFieldsScoped({ handle }, scope)

  const updateEmail = async (email: string, scope: TargetScope = 'auto') =>
    updateFieldsScoped({ email }, scope)

  const updateBio = async (bio: string, scope: TargetScope = 'auto') =>
    updateFieldsScoped({ bio }, scope)

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
    updateFields: updateFieldsScoped,
    updateDisplayName,
    updateHandle,
    updateEmail,
    updateBio,
    updateAvatar,
  }
}
