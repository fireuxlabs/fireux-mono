import { defineEventHandler, readBody } from 'h3'
import { updateKitchenMenuSection } from '../../../../../menu/server/sections/commands'
export default defineEventHandler(async event => updateKitchenMenuSection(event, await readBody(event)))
