import { defineEventHandler, readBody } from 'h3'
import { deleteItem } from '../../../../../kitchen/server/items/delete'
export default defineEventHandler(async (event) =>
  deleteItem(event, await readBody(event))
)
