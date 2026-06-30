import { deleteDoc, doc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import {
  ChefStorage,
  type Chef,
} from '../../../../../../models/chef.model'

type DeleteScope = 'auto' | 'core' | 'app' | 'both'

export function useChefDelete(_profile: ProfileRefs<Chef>) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const hasAppScope = Boolean(appId)

  const resolveUid = async (explicitId?: string) => {
    if (explicitId) return explicitId
    const u = await useRequireUser()
    if (!u?.uid) throw new Error('Not authenticated')
    return u.uid
  }

  const deleteAtPath = async (collection: string, id: string) => {
    await deleteDoc(doc(db, collection, id))
  }

  const deleteChef = async (options?: { scope?: DeleteScope; id?: string }) => {
    const scope = options?.scope ?? 'auto'
    const id = await resolveUid(options?.id)

    const shouldDeleteCore =
      scope === 'core' || scope === 'both' || (!hasAppScope && scope === 'auto')
    if (shouldDeleteCore) {
      await deleteAtPath(ChefStorage.rootCollection, id)
    }

    const deleteAppScope =
      scope === 'app' || scope === 'both' || (hasAppScope && scope === 'auto')
    if (deleteAppScope) {
      if (!appId) throw new Error('Missing appId for app-scoped delete')
      await deleteAtPath(`${AppStorage.collection}/${appId}/${ChefStorage.overlayCollection}`, id)
    }

    let effectiveScope: DeleteScope = scope
    if (scope === 'auto') {
      effectiveScope = hasAppScope ? 'app' : 'core'
    }

    return { id, scope: effectiveScope }
  }

  return { deleteChef }
}
