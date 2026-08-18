import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/console/useConsoleWriteGuard'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { KitchenStationStorage } from '../../../../../models/station.model.ts'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../../../firestore/utils/paths/useKitchenChildCollection'

export function useKitchenStationDelete(options: {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
} = {}) {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()

  async function deleteKitchenStation(kitchenId: string, stationId: string) {
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

    await deleteDocument(collectionPath, resolvedStationId)
  }

  return { deleteKitchenStation }
}
