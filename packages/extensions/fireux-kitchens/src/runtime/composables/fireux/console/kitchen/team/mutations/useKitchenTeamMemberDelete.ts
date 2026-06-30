import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { KitchenTeamMemberStorage } from '../../../../../../models/kitchen/team.model'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

export function useKitchenTeamMemberDelete(options: {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
} = {}) {
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()

  async function deleteKitchenTeamMember(kitchenId: string, memberId: string) {
    const resolvedKitchenId = normalizeString(kitchenId)
    const resolvedMemberId = normalizeString(memberId)
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')
    if (!resolvedMemberId) throw new Error('Team member id is required')

    const collectionPath = resolveKitchenChildCollectionPath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      kitchenId: resolvedKitchenId,
      collectionName: KitchenTeamMemberStorage.collection,
      appId,
    })

    await deleteDocument(collectionPath, resolvedMemberId)
  }

  return { deleteKitchenTeamMember }
}
