import { defineEventHandler, getRouterParam } from 'h3'
import { listReservations } from '../../../../../../property/server/operations/reservations/read.ts'

export default defineEventHandler(event =>
  listReservations(event, getRouterParam(event, 'propertyId'))
)
