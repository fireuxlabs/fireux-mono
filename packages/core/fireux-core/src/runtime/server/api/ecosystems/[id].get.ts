import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam, setResponseHeaders } from 'h3'
import { readEcosystem } from '../../../ecosystem/server/identity/read.ts'

export default defineLiveReadHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control':
      'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })
  return { ecosystem: await readEcosystem(getRouterParam(event, 'id')) }
})
