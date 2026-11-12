import { kitchenStationsTarget } from './default'
import { createError } from 'h3'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'

export async function requireItemPreparationStations(
  tx: GuardedServerTransaction,
  kitchenId: string,
  input: { preparation_station_ids?: string[] }
) {
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
