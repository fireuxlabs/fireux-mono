import type { Ref } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  KitchenTeamMemberStorage,
  type KitchenTeamMember,
} from '../../../../../../../models/kitchen-team.model'
import { useKitchenChildCollection } from '../../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

export function useKitchenTeamMemberCollection(
  kitchenId: Ref<string> | string,
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const state = useKitchenChildCollection<KitchenTeamMember>(
    KitchenTeamMemberStorage.collection,
    kitchenId,
    options
  )
  const { byId: kitchenTeamMember } = useCollectionById(state.items)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    collectionPath: state.collectionPath,
    kitchenTeamMembers: state.items,
    kitchenTeamMember,
    pending: state.pending,
  }
}
