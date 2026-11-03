import { defineEventHandler, readBody } from 'h3'
import { readKitchenDocumentMenu } from '../../../../../menu/server/document/read'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return readKitchenDocumentMenu(event, {
    kitchenId: body?.kitchenId,
    menuId: body?.menuId || undefined,
    claimSecret: body?.claimSecret || undefined,
  })
})
