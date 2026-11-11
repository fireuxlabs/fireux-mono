import { defineEventHandler, readBody } from 'h3'
import { saveKitchenItemGroup } from '../../../../../kitchen/server/item-groups/save'
export default defineEventHandler(async (event) =>
  saveKitchenItemGroup(event, await readBody(event), 'update')
)
