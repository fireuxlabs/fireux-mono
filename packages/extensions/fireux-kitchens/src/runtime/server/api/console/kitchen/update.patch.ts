import { defineEventHandler, readBody } from 'h3'
import { updateKitchen } from '../../../../kitchen/server/identity/update.ts'

export default defineEventHandler(async (event) =>
  updateKitchen(event, await readBody(event))
)
