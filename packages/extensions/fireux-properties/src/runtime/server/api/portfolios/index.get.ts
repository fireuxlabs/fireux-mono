import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { readPortfolioDirectoryPage } from '../../../portfolio/server/index/read'

export default defineLiveReadHandler((event) =>
  readPortfolioDirectoryPage(getQuery(event).cursor)
)
