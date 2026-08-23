import { defineEventHandler, readBody } from 'h3'
import { createKitchenShell } from '../../../../kitchen/server/index/onboarding/commands'

export default defineEventHandler(async (event) =>
  createKitchenShell(event, await readBody(event))
)
