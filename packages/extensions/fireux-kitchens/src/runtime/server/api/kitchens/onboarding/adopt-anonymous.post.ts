import { defineEventHandler, readBody } from 'h3'
import { adoptAnonymousKitchen } from '../../../../kitchen/server/index/onboarding/commands'

export default defineEventHandler(async (event) =>
  adoptAnonymousKitchen(event, await readBody(event))
)
