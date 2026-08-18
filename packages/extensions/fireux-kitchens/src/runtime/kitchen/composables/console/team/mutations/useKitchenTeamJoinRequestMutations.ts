import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/console/useConsoleWriteGuard'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { unref, type Ref } from 'vue'
import {
  KitchenTeamJoinRequestStorage,
  type KitchenTeamJoinRequest,
} from '../../../../models/team.model.ts'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../../firestore/utils/paths/useKitchenChildCollection'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenTeamJoinRequestMutations(options: Options = {}) {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { appId } = useFireUXConfig()
  const create = useFirestoreClientCreate()
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })

  const path = (kitchenId: string) =>
    resolveKitchenChildCollectionPath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      kitchenId,
      collectionName: KitchenTeamJoinRequestStorage.collection,
      appId,
    })

  const createKitchenTeamJoinRequest = async (input: {
    kitchenId: string
    userId: string
    name?: string
    message?: string
  }) => {
    requireWritableData()
    const kitchenId = normalizeString(input.kitchenId)
    const userId = normalizeString(input.userId)
    const collectionPath = path(kitchenId)

    if (!collectionPath) throw new Error('Kitchen id is required')
    if (!userId) throw new Error('User id is required')

    return create(
      defineRuntimeClientCreateTarget(
        'project.kitchen-team-join-requests',
        collectionPath
      ),
      {
        kitchen_id: kitchenId,
        user_id: userId,
        name: normalizeString(input.name),
        message: normalizeString(input.message),
        status: 'pending',
      },
      { app: true, creator: true }
    )
  }

  const updateKitchenTeamJoinRequest = async (
    kitchenId: string,
    requestId: string,
    patch: Partial<Omit<KitchenTeamJoinRequest, 'id' | 'created' | 'updated' | 'kitchen_id'>>
  ) => {
    requireWritableData()
    const collectionPath = path(kitchenId)
    const id = normalizeString(requestId)
    if (!collectionPath || !id) throw new Error('Missing join request')
    await updateDocument<KitchenTeamJoinRequest>(collectionPath, id, patch)
  }

  const deleteKitchenTeamJoinRequest = async (
    kitchenId: string,
    requestId: string
  ) => {
    requireWritableData()
    const collectionPath = path(kitchenId)
    const id = normalizeString(requestId)
    if (!collectionPath || !id) throw new Error('Missing join request')
    await deleteDocument(collectionPath, id)
  }

  return {
    createKitchenTeamJoinRequest,
    updateKitchenTeamJoinRequest,
    deleteKitchenTeamJoinRequest,
  }
}
