import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { readMenuDirectoryPage } from '../../../menu/server/index/read'

export default defineLiveReadHandler((event) => {
  const query = getQuery(event)
  return readMenuDirectoryPage({
    kitchenSlug: query.kitchenSlug,
    service: query.service,
    search: query.search,
    offering: query.offering,
    cursor: query.cursor,
    limit: query.limit,
  })
})
