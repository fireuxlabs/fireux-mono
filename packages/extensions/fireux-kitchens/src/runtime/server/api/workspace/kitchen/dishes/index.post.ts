import { defineEventHandler, readBody } from 'h3'
import { createItem } from '../../../../../kitchen/server/items/create'
export default defineEventHandler(async (event) =>
  createItem(event, await readBody(event))
)
