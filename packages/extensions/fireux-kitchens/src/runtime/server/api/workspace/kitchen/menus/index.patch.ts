import { defineEventHandler, readBody } from 'h3'
import { updateKitchenMenu } from '../../../../../menu/server/workspace-commands'
export default defineEventHandler(async event => updateKitchenMenu(event, await readBody(event)))
