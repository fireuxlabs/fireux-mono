import {
  createError,
  defineEventHandler,
  readBody,
} from 'h3'
import { setToolProviderResponseHeaders } from 'fireux-core/runtime/server/utils/tool-provider.ts'
import {
  hasDocToolStorageEndpoints,
  normalizeDocToolConfig,
} from '../../../utils/tools/doc'
import { createToolConfig } from '../../../utils/tools/config-store'

export default defineEventHandler(async (event) => {
  setToolProviderResponseHeaders(event)

  const body = await readBody(event).catch(() => ({}))
  if (!hasDocToolStorageEndpoints(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Doc tool consumers must provide their own create and availability endpoints.',
    })
  }

  const config = normalizeDocToolConfig(body)
  return createToolConfig(event, 'doc', config)
})
