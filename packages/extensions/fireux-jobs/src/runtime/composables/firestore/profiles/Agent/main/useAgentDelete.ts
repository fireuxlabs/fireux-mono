import { useFirestore } from 'vuefire'
import { deleteDoc, doc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/firebase/useRequireUser.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { AgentProfile } from '../../../../../models/profiles/Agent.model.ts'

type DeleteScope = 'auto' | 'core' | 'app' | 'both'

export function useAgentDelete(_profile: ProfileRefs<AgentProfile>) {
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

  const deleteAgent = async (options?: {
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
      await deleteAtPath('agents', id)
    }

    const deleteAppScope =
      scope === 'app' || scope === 'both' || (isTenant && scope === 'auto')

    if (deleteAppScope) {
      if (!appId) throw new Error('Missing appId for tenant-scoped delete')
      await deleteAtPath(`apps/${appId}/agents`, id)
    }

    let effectiveScope: DeleteScope = scope
    if (scope === 'auto') {
      effectiveScope = isTenant ? 'app' : 'core'
    }

    return { id, scope: effectiveScope }
  }

  return { deleteAgent }
}
