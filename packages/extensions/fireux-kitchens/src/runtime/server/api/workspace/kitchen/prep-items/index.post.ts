import { defineEventHandler, readBody } from 'h3'
import { createKitchenPrepItem } from '../../../../../kitchen/server/prep-items/create'
export default defineEventHandler(async event => createKitchenPrepItem(event, await readBody(event)))
