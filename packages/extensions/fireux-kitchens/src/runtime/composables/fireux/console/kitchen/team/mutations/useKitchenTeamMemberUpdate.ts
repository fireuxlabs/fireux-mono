import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { Ref } from 'vue'
import { unref } from 'vue'
import {
  KitchenTeamMemberStorage,
  type KitchenTeamMember,
  type KitchenTeamMemberUpdateInput,
} from '../../../../../../models/kitchen-team.model'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

export function useKitchenTeamMemberUpdate(options: {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
} = {}) {
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()

  async function updateKitchenTeamMember(
    kitchenId: string,
    memberId: string,
    patch: KitchenTeamMemberUpdateInput
  ) {
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

    await updateDocument<KitchenTeamMember>(collectionPath, resolvedMemberId, patch)
  }

  return { updateKitchenTeamMember }
}
