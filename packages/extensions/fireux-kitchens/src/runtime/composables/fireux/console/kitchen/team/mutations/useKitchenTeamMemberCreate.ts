import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  KitchenTeamMemberStorage,
  KitchenTeamMemberModel,
  type KitchenTeamMember,
} from '../../../../../../models/kitchen/team.model'

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
  normalizeString(value)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
export function useKitchenTeamMemberCreate() {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const create = useFirestoreClientCreate()

  const createKitchenTeamMember = async (input: CreateKitchenTeamMemberInput) => {
    requireWritableData()
    const kitchenId = normalizeString(input.kitchenId)
    const rootCollection = normalizeString(input.kitchenCollectionPath)
    const name = normalizeString(input.name)
    const memberId = slugifyTeamMemberName(name)

    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!rootCollection) throw new Error('Kitchen collection path is required')
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

    const collectionPath =
      `${rootCollection}/${kitchenId}/${KitchenTeamMemberStorage.collection}`
    await create(
      defineRuntimeClientCreateTarget(
        'project.kitchen-team-members',
        collectionPath
      ),
      payload,
      { id: memberId, app: true, creator: true }
    )

    return memberId
  }

  return { createKitchenTeamMember }
}
