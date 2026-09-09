import { defineEventHandler, readBody } from 'h3'
import { interpretKitchenMenus } from '../../../../../kitchen/server/menus/intent'

export default defineEventHandler(async (event) =>
  interpretKitchenMenus(event, await readBody(event))
)
