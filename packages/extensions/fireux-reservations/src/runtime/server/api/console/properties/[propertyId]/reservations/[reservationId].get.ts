import { defineEventHandler, getRouterParam } from 'h3'
import { getReservation } from '../../../../../reservation/read.ts'

export default defineEventHandler(event =>
  getReservation(
    event,
    getRouterParam(event, 'propertyId'),
    getRouterParam(event, 'reservationId')
  )
)
