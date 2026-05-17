import { computed } from 'vue'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  readRuntimeSimulationFirestoreDatabaseId,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { KitchenTeamMemberModel, type KitchenTeamMember } from '../../../../../../../models/kitchen-team.model'

type CreateKitchenTeamMemberInput = {
  kitchenId: string
  kitchenCollectionPath?: string
  name: string
  role?: string
  stationIds?: string[]
  sortOrder?: number
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeStringArray = (value: unknown) =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => normalizeString(item))
        .filter(Boolean)
    )
  )
const slugifyTeamMemberName = (value: string) =>
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
      'Missing firebase.simulationDatabaseId for kitchen test-mode team writes.'
    )
  }
  return databaseId
}

export function useKitchenTeamMemberCreate() {
  const databaseId = computed(() => requireSimulationDatabaseId())
  const { setDocument } = useFirestoreCreate({ databaseId })

  const createKitchenTeamMember = async (input: CreateKitchenTeamMemberInput) => {
    const kitchenId = normalizeString(input.kitchenId)
    const rootCollection = normalizeString(input.kitchenCollectionPath)
    const name = normalizeString(input.name)
    const memberId = slugifyTeamMemberName(name)

    if (!kitchenId) throw new Error('Kitchen id is required')
    if (rootCollection !== 'kitchens') {
      throw new Error('Team member creates are only enabled for test kitchens.')
    }
    if (!name) throw new Error('Team member name is required')
    if (!memberId) throw new Error('Team member id could not be generated from name')

    const sortOrder = Number(input.sortOrder)
    const payload: KitchenTeamMember = {
      ...KitchenTeamMemberModel,
      kitchen_id: kitchenId,
      name,
      display_name: name,
      role: normalizeString(input.role),
      station_ids: normalizeStringArray(input.stationIds),
      active: true,
      status: 'active',
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    }

    await setDocument<KitchenTeamMember>(
      `${rootCollection}/${kitchenId}/team`,
      memberId,
      payload,
      { app: true, creator: true }
    )

    return memberId
  }

  return { createKitchenTeamMember }
}
