import { defineEventHandler, readBody } from 'h3'
import { createKitchenMenu } from '../../../../../menu/server/records/create'
export default defineEventHandler(async (event) =>
  createKitchenMenu(event, await readBody(event))
)
