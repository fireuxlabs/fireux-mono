import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { createReservationCommand } from '../../../../../../property/server/reservations/command.ts'

export default defineEventHandler(async event =>
  createReservationCommand(
    event,
    getRouterParam(event, 'propertyId'),
    await readBody(event)
  )
)
