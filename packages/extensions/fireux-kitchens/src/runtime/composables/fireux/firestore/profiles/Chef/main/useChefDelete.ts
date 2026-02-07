import { deleteDoc, doc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useFirestore } from 'vuefire'
import type { ChefCore } from '../../../../../../models/profiles/Chef/Chef.model'

type DeleteScope = 'auto' | 'core' | 'app' | 'both'

export function useChefDelete(_profile: ProfileRefs<ChefCore>) {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

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
      scope === 'core' || scope === 'both' || (!isTenant && scope === 'auto')
    if (shouldDeleteCore) {
      await deleteAtPath('chefs', id)
    }

    const deleteAppScope =
      scope === 'app' || scope === 'both' || (isTenant && scope === 'auto')
    if (deleteAppScope) {
      if (!appId) throw new Error('Missing appId for tenant-scoped delete')
      await deleteAtPath(`apps/${appId}/chefs`, id)
    }

    let effectiveScope: DeleteScope = scope
    if (scope === 'auto') {
      effectiveScope = isTenant ? 'app' : 'core'
    }

    return { id, scope: effectiveScope }
  }

  return { deleteChef }
}
