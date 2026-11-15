import { defineEventHandler, readBody } from 'h3'
import { updateKitchenGuidance } from '../../../../kitchen/server/context/guidance'

export default defineEventHandler(async (event) =>
  updateKitchenGuidance(event, await readBody(event))
)
