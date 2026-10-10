import { defineEventHandler, readBody } from 'h3'
import { renameKitchenMenu } from '../../../../../menu/server/records/update'
export default defineEventHandler(async event => renameKitchenMenu(event, await readBody(event)))
