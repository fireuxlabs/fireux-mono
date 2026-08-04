import { defineEventHandler, readBody } from 'h3'
import { setToolProviderResponseHeaders } from 'fireux-core/runtime/server/utils/tool-provider'
import { createToolConfig } from '../../../utils/tools/config-store'
import { normalizeUrlToolConfig } from '../../../utils/tools/url'

export default defineEventHandler(async (event) => {
  setToolProviderResponseHeaders(event)

  const body = await readBody(event).catch(() => ({}))
  const config = normalizeUrlToolConfig(body)

  return createToolConfig(event, 'url', config)
})
