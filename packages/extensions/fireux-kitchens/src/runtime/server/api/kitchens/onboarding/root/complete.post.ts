import { defineEventHandler, readBody } from 'h3'
import { completeKitchenRootOnboarding } from '../../../../kitchen/root-onboarding'

export default defineEventHandler(async event =>
  completeKitchenRootOnboarding(event, await readBody(event))
)
