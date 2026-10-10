import { defineEventHandler, readBody } from 'h3'
import { deleteKitchenMenu } from '../../../../../menu/server/records/delete'
export default defineEventHandler(async event => deleteKitchenMenu(event, await readBody(event)))
