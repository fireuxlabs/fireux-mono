import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam } from 'h3'
import { setToolProviderResponseHeaders } from 'fireux-core/runtime/server/utils/tool-provider'
import { readToolConfig } from '../../../utils/tools/config-store'
import {
  type GoQrUrlToolConfig,
  normalizeUrlToolConfig,
} from '../../../utils/tools/url'

export default defineLiveReadHandler(async (event) => {
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
