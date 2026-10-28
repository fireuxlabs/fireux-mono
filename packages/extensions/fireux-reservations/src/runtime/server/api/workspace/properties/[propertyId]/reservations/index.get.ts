import { defineEventHandler, setResponseHeader, getRouterParam } from 'h3'

import { listReservations } from '../../../../../../property/server/reservations/read.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return listReservations(event, getRouterParam(event, 'propertyId'))
})
