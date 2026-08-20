import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  KitchenStationStorage,
  KitchenStationDefaults,
  type KitchenStation,
} from '../../../../../models/station.model.ts'

type CreateKitchenStationInput = {
  kitchenId: string
  kitchenCollectionPath?: string
  name: string
  sortOrder?: number
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const slugifyStationName = (value: string) =>
  normalizeString(value)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function useKitchenStationCreate() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const create = useFirestoreClientCreate()

  const createKitchenStation = async (input: CreateKitchenStationInput) => {
    requireWritableData()
    const kitchenId = normalizeString(input.kitchenId)
    const rootCollection = normalizeString(input.kitchenCollectionPath)
    const name = normalizeString(input.name)
    const stationId = slugifyStationName(name)

    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!rootCollection) throw new Error('Kitchen collection path is required')
    if (!name) throw new Error('Station name is required')
    if (!stationId) throw new Error('Station id could not be generated from name')

    const sortOrder = Number(input.sortOrder)
    const payload: KitchenStation = {
      ...KitchenStationDefaults,
      kitchen_id: kitchenId,
      name,
      active: true,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    }

    const collectionPath =
      `${rootCollection}/${kitchenId}/${KitchenStationStorage.collection}`
    await create(
      defineRuntimeClientCreateTarget(
        'project.kitchen-stations',
        collectionPath
      ),
      payload,
      { id: stationId, app: true, creator: true }
    )

    return stationId
  }

  return { createKitchenStation }
}
