import { defineEventHandler, readBody } from 'h3'
import { updateItem } from '../../../../../kitchen/server/items/update'
export default defineEventHandler(async (event) =>
  updateItem(event, await readBody(event))
)
