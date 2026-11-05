import {
  defineEventHandler,
  setResponseHeader,
  getRouterParam,
  setResponseHeaders,
  type H3Event,
} from 'h3'

import { readAppDetail } from '../../../app/server/detail/read'
import type { DetailResponse } from '../../../models/utils/directory'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    // Detail consumers can turn the App website into durable links.
    // Revalidate every lookup so a changed doorway is never served stale.
    'Cache-Control': 'no-store',
  })

  const app = await readAppDetail(getRouterParam(event, 'id'))
  const response: DetailResponse<typeof app> = {
    ok: true,
    generatedAt: new Date().toISOString(),
    item: app,
  }

  return response
})
