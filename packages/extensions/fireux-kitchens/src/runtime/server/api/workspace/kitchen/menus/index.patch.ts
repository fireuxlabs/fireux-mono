import { defineEventHandler, readBody } from 'h3'
import { updateKitchenMenu } from '../../../../../menu/server/records/update'
export default defineEventHandler(async event => updateKitchenMenu(event, await readBody(event)))
