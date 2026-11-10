import { defineEventHandler, readBody } from 'h3'
import { readKitchenMenuDocumentFile } from '../../../../../menu/server/document/read-file'
import { setProtectedMenuFileResponse } from '../../../../../menu/server/document/protected-file'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = await readKitchenMenuDocumentFile(event, {
    kitchenId: body?.kitchenId,
    menuId: body?.menuId,
    expectedRevision: body?.expectedRevision,
    claimSecret: body?.claimSecret,
  })
  return setProtectedMenuFileResponse(event, result)
})
