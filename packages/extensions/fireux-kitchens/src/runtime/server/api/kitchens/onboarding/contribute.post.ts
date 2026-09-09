import { defineEventHandler, readBody } from 'h3'
import { contributeKitchenDirectory } from '../../../../kitchen/server/index/onboarding/directory'

export default defineEventHandler(async (event) =>
  contributeKitchenDirectory(event, await readBody(event))
)
