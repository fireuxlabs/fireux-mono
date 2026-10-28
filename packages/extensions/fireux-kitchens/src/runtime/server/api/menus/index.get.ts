import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readMenuDirectoryPage } from '../../../menu/server/index/read'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

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
