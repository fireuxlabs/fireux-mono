import { defineEventHandler, readBody } from 'h3'
import { createKitchenMenuItem } from '../../../../../menu/server/workspace-commands'
export default defineEventHandler(async event => createKitchenMenuItem(event, await readBody(event)))
