import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import type { Ref } from 'vue'
import { unref } from 'vue'
import {
  KitchenStationStorage,
  type KitchenStation,
  type KitchenStationUpdateInput,
} from '../../../../../../../models/kitchen/station.model'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

export function useKitchenStationUpdate(options: {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
} = {}) {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()

  async function updateKitchenStation(
    kitchenId: string,
    stationId: string,
    patch: KitchenStationUpdateInput
  ) {
    requireWritableData()
    const resolvedKitchenId = normalizeString(kitchenId)
    const resolvedStationId = normalizeString(stationId)
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')
    if (!resolvedStationId) throw new Error('Station id is required')

    const collectionPath = resolveKitchenChildCollectionPath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      kitchenId: resolvedKitchenId,
      collectionName: KitchenStationStorage.collection,
      appId,
    })

    await updateDocument<KitchenStation>(collectionPath, resolvedStationId, patch)
  }

  return { updateKitchenStation }
}
