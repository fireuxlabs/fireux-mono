import { defineEventHandler, readBody } from 'h3'
import { setToolProviderResponseHeaders } from 'fireux-core/runtime/server/utils/tool-provider'
import { createToolConfig } from '../../../utils/tools/config-store'
import { normalizeTextToolConfig } from '../../../utils/tools/text'

export default defineEventHandler(async (event) => {
  setToolProviderResponseHeaders(event)

  const body = await readBody(event).catch(() => ({}))
  const config = normalizeTextToolConfig(body)

  return createToolConfig(event, 'text', config)
})
