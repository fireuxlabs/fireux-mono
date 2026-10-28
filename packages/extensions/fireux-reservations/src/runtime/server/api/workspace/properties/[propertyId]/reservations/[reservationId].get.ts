import { defineEventHandler, setResponseHeader, getRouterParam } from 'h3'

import { getReservation } from '../../../../../../property/server/reservations/read.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return getReservation(
    event,
    getRouterParam(event, 'propertyId'),
    getRouterParam(event, 'reservationId')
  )
})
