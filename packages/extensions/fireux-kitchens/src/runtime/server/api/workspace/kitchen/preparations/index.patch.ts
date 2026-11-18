import { defineEventHandler, readBody } from 'h3'
import { updatePreparation } from '../../../../../kitchen/server/preparations/update'
export default defineEventHandler(async (event) =>
  updatePreparation(event, await readBody(event))
)
