import { defineEventHandler, readBody } from 'h3'
import { createKitchenMenuItem } from '../../../../../menu/server/items/write'
export default defineEventHandler(async event => createKitchenMenuItem(event, await readBody(event)))
