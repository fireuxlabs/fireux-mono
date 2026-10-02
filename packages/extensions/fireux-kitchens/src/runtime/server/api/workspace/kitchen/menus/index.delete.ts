import { defineEventHandler, readBody } from 'h3'
import { deleteKitchenMenu } from '../../../../../menu/server/workspace-commands'
export default defineEventHandler(async event => deleteKitchenMenu(event, await readBody(event)))
