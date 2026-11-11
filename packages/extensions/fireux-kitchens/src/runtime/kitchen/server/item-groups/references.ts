import { kitchenStationsTarget } from '../stations/default'
import { createError } from 'h3'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { kitchenItemGroupsTarget } from './targets'

export async function requireItemOrganisationReferences(
  tx: GuardedServerTransaction,
  kitchenId: string,
  input: { group_ids?: string[]; preparation_station_ids?: string[] }
) {
  for (const id of input.group_ids || []) {
    const group = await tx.read(kitchenItemGroupsTarget(kitchenId), id)
    if (
      !group.exists ||
      group.data?.kitchen_id !== kitchenId ||
      group.data?.active === false
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'An Item group is unavailable in this Kitchen.',
      })
  }
  for (const id of input.preparation_station_ids || []) {
    const station = await tx.read(kitchenStationsTarget(kitchenId), id)
    if (
      !station.exists ||
      station.data?.kitchen_id !== kitchenId ||
      station.data?.active === false ||
      station.data?.role === 'coordination' ||
      (station.data?.role === undefined && id === 'pass')
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'Choose an active preparation Station in this Kitchen.',
      })
  }
}
