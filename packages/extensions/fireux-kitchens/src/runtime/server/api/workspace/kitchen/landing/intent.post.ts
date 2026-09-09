import { defineEventHandler, readBody } from 'h3'
import { interpretKitchenLanding } from '../../../../../kitchen/server/index/landing-intent'

export default defineEventHandler(async (event) =>
  interpretKitchenLanding(event, await readBody(event))
)
