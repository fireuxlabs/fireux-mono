import { defineEventHandler, readBody } from 'h3'
import { moveKitchenMenuEntry } from '../../../../../menu/server/display-order'
export default defineEventHandler(async (event) =>
  moveKitchenMenuEntry(event, await readBody(event))
)
