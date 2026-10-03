import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam } from 'h3'
import { listReservations } from '../../../../../../property/server/reservations/read.ts'

export default defineLiveReadHandler((event) =>
  listReservations(event, getRouterParam(event, 'propertyId'))
)
