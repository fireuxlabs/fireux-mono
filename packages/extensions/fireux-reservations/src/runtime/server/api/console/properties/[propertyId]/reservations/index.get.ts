import { defineEventHandler, getRouterParam } from 'h3'
import { listReservations } from '../../../../../reservation/read.ts'

export default defineEventHandler(event =>
  listReservations(event, getRouterParam(event, 'propertyId'))
)
