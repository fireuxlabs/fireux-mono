import type { Ref } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  KitchenTeamJoinRequestStorage,
  type KitchenTeamJoinRequest,
} from '../../../../../../models/kitchen-team.model'
import { useKitchenChildCollection } from '../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

export function useKitchenTeamJoinRequestCollection(
  kitchenId: Ref<string> | string,
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const state = useKitchenChildCollection<KitchenTeamJoinRequest>(
    KitchenTeamJoinRequestStorage.collection,
    kitchenId,
    options
  )
  const { byId: kitchenTeamJoinRequest } = useCollectionById(state.items)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    collectionPath: state.collectionPath,
    kitchenTeamJoinRequests: state.items,
    kitchenTeamJoinRequest,
    pending: state.pending,
  }
}
