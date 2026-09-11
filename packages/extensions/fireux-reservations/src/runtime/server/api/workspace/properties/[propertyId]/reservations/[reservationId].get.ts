import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam } from 'h3'
import { getReservation } from '../../../../../../property/server/operations/reservations/read.ts'

export default defineLiveReadHandler((event) =>
  getReservation(
    event,
    getRouterParam(event, 'propertyId'),
    getRouterParam(event, 'reservationId')
  )
)
