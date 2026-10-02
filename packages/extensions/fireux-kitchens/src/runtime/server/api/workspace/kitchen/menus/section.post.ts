import { defineEventHandler, readBody } from 'h3'
import { createKitchenMenuSection } from '../../../../../menu/server/sections/commands'
export default defineEventHandler(async event => createKitchenMenuSection(event, await readBody(event)))
