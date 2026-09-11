import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery, setResponseHeaders, type H3Event } from 'h3'
import { readCompanyDirectoryPage } from '../../../place/server/company/directory'

export default defineLiveReadHandler((event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control':
      'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })
  return readCompanyDirectoryPage(getQuery(event))
})
