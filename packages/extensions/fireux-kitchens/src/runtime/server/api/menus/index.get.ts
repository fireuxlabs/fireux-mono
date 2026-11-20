import { getQuery } from 'h3'
import { defineLiveProjection } from 'fireux-core/runtime/server/utils/live-projection'

import { readMenuDirectoryPage } from '../../../menu/server/index/read'

export default defineLiveProjection({
  access: 'public',
  read: (event, sources) => {
    const query = getQuery(event)
    return readMenuDirectoryPage({
      kitchenSlug: query.kitchenSlug,
      service: query.service,
      search: query.search,
      dishId: query.dishId,
      offering: query.offering,
      cursor: query.cursor,
      limit: query.limit,
      sources,
    })
  },
})
