import { defineEventHandler, setResponseHeader, getRouterParam } from 'h3'

import { readPlatformEcosystem } from '../../utils/ecosystems'
import { toEcosystemPublicSummary } from 'fireux-core/runtime/ecosystem/server/identity/read'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return {
    ecosystem: toEcosystemPublicSummary(
      await readPlatformEcosystem(getRouterParam(event, 'id') || '')
    ),
  }
})
