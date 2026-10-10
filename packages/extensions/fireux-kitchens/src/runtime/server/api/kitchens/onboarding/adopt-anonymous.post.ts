import { defineEventHandler, readBody } from 'h3'
import { connectGuestKitchen } from '../../../../kitchen/server/index/onboarding/connect-guest'

export default defineEventHandler(async (event) =>
  connectGuestKitchen(event, await readBody(event))
)
