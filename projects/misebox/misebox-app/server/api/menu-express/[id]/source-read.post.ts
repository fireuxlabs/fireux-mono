import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseHeaders,
} from 'h3'
import { downloadStorageFile } from 'fireux-core/runtime/server/utils/uploads/storage'
import { readRequest } from '../../../menu-express/read'
import { fail, requestId } from '../../../menu-express/contract'
import { context } from '../../../menu-express/authority'
export default defineEventHandler(async (event) => {
  const id = requestId(getRouterParam(event, 'id')),
    input = await readBody(event)
  const { request } = await readRequest(event, id, input)
  const source = request.sources.find((s) => s.id === input.sourceId)
  if (!source) fail('Source not found.', 404)
  const { appId } = context(event)
  const { buffer } = await downloadStorageFile({
    objectPath: `apps/${appId}/menu-express/${id}/sources/${source.id}`,
  })
  setResponseHeaders(event, {
    'Content-Type': source.type,
    'Content-Disposition': `attachment; filename="${source.name.replaceAll('"', '')}"`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  return buffer
})
