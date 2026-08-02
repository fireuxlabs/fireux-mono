import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { createReservationCommand } from '../../../../../reservation/command.ts'

export default defineEventHandler(async event =>
  createReservationCommand(
    event,
    getRouterParam(event, 'propertyId'),
    await readBody(event)
  )
)
