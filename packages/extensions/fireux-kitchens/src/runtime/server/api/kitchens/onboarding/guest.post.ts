import { defineEventHandler, readBody } from 'h3'
import { startGuestKitchen } from '../../../../kitchen/server/index/onboarding/guest'
export default defineEventHandler(async (event) =>
  startGuestKitchen(event, await readBody(event))
)
