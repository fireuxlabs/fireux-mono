import { deleteDoc, doc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { ProfessionalCore } from '../../../../../../models/profiles/Professional/Professional.model'

type DeleteScope = 'auto' | 'core' | 'app' | 'both'

export function useProfessionalDelete(
  _profile: ProfileRefs<ProfessionalCore>
) {
  const db = useFirestore()
  const { deleteSeoIndexDoc } = useSeoIndexWrite()
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

  const deleteProfessional = async (options?: {
    scope?: DeleteScope
    id?: string
  }) => {
    const scope = options?.scope ?? 'auto'
    const id = await resolveUid(options?.id)

    if (
      scope === 'core' ||
      scope === 'both' ||
      (!isTenant && scope === 'auto')
    ) {
      await deleteAtPath('professionals', id)
      await deleteSeoIndexDoc('seo_index_professionals', id)
    }

    const deleteAppScope =
      scope === 'app' || scope === 'both' || (isTenant && scope === 'auto')

    if (deleteAppScope) {
      if (!appId) throw new Error('Missing appId for tenant-scoped delete')
      await deleteAtPath(`apps/${appId}/professionals`, id)
    }

    let effectiveScope: DeleteScope = scope
    if (scope === 'auto') {
      effectiveScope = isTenant ? 'app' : 'core'
    }

    return { id, scope: effectiveScope }
  }

  return { deleteProfessional }
}
