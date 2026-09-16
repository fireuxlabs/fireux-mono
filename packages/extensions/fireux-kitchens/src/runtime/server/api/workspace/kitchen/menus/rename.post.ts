import { defineEventHandler, readBody } from 'h3'
import { renameKitchenMenu } from '../../../../../menu/server/workspace-commands'
export default defineEventHandler(async event => renameKitchenMenu(event, await readBody(event)))
