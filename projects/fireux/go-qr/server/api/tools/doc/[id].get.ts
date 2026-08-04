import {
  createError,
  defineEventHandler,
  getRouterParam,
} from 'h3'
import { setToolProviderResponseHeaders } from 'fireux-core/runtime/server/utils/tool-provider'
import {
  type GoQrDocToolConfig,
  hasDocToolStorageEndpoints,
  normalizeDocToolConfig,
} from '../../../utils/tools/doc'
import { readToolConfig } from '../../../utils/tools/config-store'

export default defineEventHandler(async (event) => {
  setToolProviderResponseHeaders(event)

  const { id, config: rawConfig } = await readToolConfig(
    'doc',
    getRouterParam(event, 'id')
  )
  if (!hasDocToolStorageEndpoints(rawConfig)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Doc tool config is missing consumer storage endpoints.',
    })
  }

  const config = normalizeDocToolConfig(rawConfig) satisfies GoQrDocToolConfig

  return {
    ok: true,
    tool: 'doc',
    id,
    config,
  }
})
