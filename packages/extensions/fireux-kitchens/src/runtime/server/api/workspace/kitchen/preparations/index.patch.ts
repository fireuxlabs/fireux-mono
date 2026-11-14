import { defineEventHandler, readBody } from 'h3'
import { updatePreparation } from '../../../../../kitchen/preparation/server/update'
export default defineEventHandler(async (event) =>
  updatePreparation(event, await readBody(event))
)
