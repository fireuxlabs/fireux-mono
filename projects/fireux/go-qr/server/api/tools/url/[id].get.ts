import { defineEventHandler, setResponseHeader, getRouterParam } from 'h3'

import { setToolProviderResponseHeaders } from 'fireux-core/runtime/server/utils/tool-provider'
import { readToolConfig } from '../../../utils/tools/config-store'
import {
  type GoQrUrlToolConfig,
  normalizeUrlToolConfig,
} from '../../../utils/tools/url'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setToolProviderResponseHeaders(event)

  const { id, config: rawConfig } = await readToolConfig(
    'url',
    getRouterParam(event, 'id')
  )
  const config = normalizeUrlToolConfig(rawConfig) satisfies GoQrUrlToolConfig

  return {
    ok: true,
    tool: 'url',
    id,
    config,
  }
})
