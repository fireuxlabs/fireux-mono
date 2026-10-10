import { defineEventHandler, readBody } from 'h3'
import { createKitchenShell } from '../../../../kitchen/server/index/onboarding/create-shell'

export default defineEventHandler(async (event) =>
  createKitchenShell(event, await readBody(event))
)
