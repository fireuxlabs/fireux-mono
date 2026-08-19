import { defineEventHandler, getQuery } from 'h3'
import { readMenuDirectoryPage } from '../../../menu/server/index/read'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  return readMenuDirectoryPage({
    kitchenSlug: query.kitchenSlug,
    cursor: query.cursor,
    limit: query.limit,
  })
})
