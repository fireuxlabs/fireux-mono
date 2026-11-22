import { defineEventHandler, readBody } from 'h3'
import { prepareKitchenDocumentMenu } from '../../../../../menu/server/document/prepare'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return prepareKitchenDocumentMenu(event, body?.kitchenId)
})
