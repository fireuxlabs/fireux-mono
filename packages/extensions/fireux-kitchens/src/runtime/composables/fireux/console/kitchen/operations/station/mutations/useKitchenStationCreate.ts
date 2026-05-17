import { computed } from 'vue'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  readRuntimeSimulationFirestoreDatabaseId,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { KitchenStationModel, type KitchenStation } from '../../../../../../../models/kitchen-station.model'

type CreateKitchenStationInput = {
  kitchenId: string
  kitchenCollectionPath?: string
  name: string
  sortOrder?: number
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const slugifyStationName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const requireSimulationDatabaseId = () => {
  const databaseId = readRuntimeSimulationFirestoreDatabaseId()
  if (!databaseId) {
    throw new Error(
      'Missing firebase.simulationDatabaseId for kitchen test-mode station writes.'
    )
  }
  return databaseId
}

export function useKitchenStationCreate() {
  const databaseId = computed(() => requireSimulationDatabaseId())
  const { setDocument } = useFirestoreCreate({ databaseId })

  const createKitchenStation = async (input: CreateKitchenStationInput) => {
    const kitchenId = normalizeString(input.kitchenId)
    const rootCollection = normalizeString(input.kitchenCollectionPath)
    const name = normalizeString(input.name)
    const stationId = slugifyStationName(name)

    if (!kitchenId) throw new Error('Kitchen id is required')
    if (rootCollection !== 'kitchens') {
      throw new Error('Station creates are only enabled for test kitchens.')
    }
    if (!name) throw new Error('Station name is required')
    if (!stationId) throw new Error('Station id could not be generated from name')

    const sortOrder = Number(input.sortOrder)
    const payload: KitchenStation = {
      ...KitchenStationModel,
      kitchen_id: kitchenId,
      name,
      active: true,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    }

    await setDocument<KitchenStation>(
      `${rootCollection}/${kitchenId}/stations`,
      stationId,
      payload,
      { app: true, creator: true }
    )

    return stationId
  }

  return { createKitchenStation }
}
