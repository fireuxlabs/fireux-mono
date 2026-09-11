import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam } from 'h3'
import { setToolProviderResponseHeaders } from 'fireux-core/runtime/server/utils/tool-provider'
import { readToolConfig } from '../../../utils/tools/config-store'
import {
  type GoQrTextToolConfig,
  normalizeTextToolConfig,
} from '../../../utils/tools/text'

export default defineLiveReadHandler(async (event) => {
  setToolProviderResponseHeaders(event)

  const { id, config: rawConfig } = await readToolConfig(
    'text',
    getRouterParam(event, 'id')
  )
  const config = normalizeTextToolConfig(rawConfig) satisfies GoQrTextToolConfig

  return {
    ok: true,
    tool: 'text',
    id,
    config,
  }
})
