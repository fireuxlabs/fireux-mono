import { defineEventHandler, setResponseHeader, getRouterParam } from 'h3'

import { readPlatformEcosystem } from '../../utils/ecosystems'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return {
    ecosystem: await readPlatformEcosystem(getRouterParam(event, 'id') || ''),
  }
})
