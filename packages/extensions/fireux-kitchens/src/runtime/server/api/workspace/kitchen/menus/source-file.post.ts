import { defineEventHandler, readBody } from 'h3'
import { readKitchenMenuSourceFile } from '../../../../../menu/server/source/read-file'
import { setProtectedMenuFileResponse } from '../../../../../menu/server/document/protected-file'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = await readKitchenMenuSourceFile(event, {
    kitchenId: body?.kitchenId,
    sourceId: body?.sourceId,
    fileId: body?.fileId,
    expectedRevision: body?.expectedRevision,
  })
  return setProtectedMenuFileResponse(event, result)
})
