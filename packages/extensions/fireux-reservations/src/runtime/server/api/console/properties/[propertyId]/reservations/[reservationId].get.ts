import { defineEventHandler, getRouterParam } from 'h3'
import { getReservation } from '../../../../../../property/server/operations/reservations/read.ts'

export default defineEventHandler(event =>
  getReservation(
    event,
    getRouterParam(event, 'propertyId'),
    getRouterParam(event, 'reservationId')
  )
)
