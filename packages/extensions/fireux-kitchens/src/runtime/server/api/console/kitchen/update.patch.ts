import { defineEventHandler, readBody } from 'h3'
import { updateKitchen } from '../../../kitchen/update.ts'

export default defineEventHandler(async event =>
  updateKitchen(event, await readBody(event))
)
