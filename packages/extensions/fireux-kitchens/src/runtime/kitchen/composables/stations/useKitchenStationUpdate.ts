import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import type { Ref } from 'vue'
import { unref } from 'vue'
import {
  KitchenStationStorage,
  type KitchenStation,
  type KitchenStationUpdateInput,
} from '../../utils/station.ts'
import { normalizeString, resolveKitchenChildCollectionPath } from '../../utils/kitchen-collection-path'

export function useKitchenStationUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { updateDocument } = useFirestoreUpdate({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()

  async function updateKitchenStation(input: {
    kitchenId: string
    stationId: string
    changes: KitchenStationUpdateInput
  }) {
    requireWritableData()
    const resolvedKitchenId = normalizeString(input.kitchenId)
    const resolvedStationId = normalizeString(input.stationId)
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')
    if (!resolvedStationId) throw new Error('Station id is required')

    const collectionPath = resolveKitchenChildCollectionPath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      kitchenId: resolvedKitchenId,
      collectionName: KitchenStationStorage.collection,
      appId,
    })

    await updateDocument<KitchenStation>(
      collectionPath,
      resolvedStationId,
      input.changes
    )
  }

  return { updateKitchenStation }
}
