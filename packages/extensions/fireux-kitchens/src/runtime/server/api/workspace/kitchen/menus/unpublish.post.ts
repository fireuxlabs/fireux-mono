import { defineEventHandler, readBody } from 'h3'
import { changeKitchenMenuPublication } from '../../../../../menu/server/publication/state'
export default defineEventHandler(async (event) =>
  changeKitchenMenuPublication(event, await readBody(event), 'unpublish')
)
