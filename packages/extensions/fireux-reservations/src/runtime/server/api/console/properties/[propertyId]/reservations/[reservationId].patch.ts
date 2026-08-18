import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateReservationCommand } from '../../../../../../property/server/operations/reservations/command.ts'

export default defineEventHandler(async event =>
  updateReservationCommand(
    event,
    getRouterParam(event, 'propertyId'),
    getRouterParam(event, 'reservationId'),
    await readBody(event)
  )
)
