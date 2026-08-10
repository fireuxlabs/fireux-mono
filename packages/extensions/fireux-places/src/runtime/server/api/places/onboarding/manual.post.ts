import { readBody } from 'h3'
import { createManualPlace } from '../../../place/manual-onboarding'

export default defineEventHandler(async (event) =>
  createManualPlace(event, await readBody(event))
)
