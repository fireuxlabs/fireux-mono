import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam } from 'h3'
import { readPortfolioDetail } from '../../../portfolio/server/index/read'

export default defineLiveReadHandler((event) =>
  readPortfolioDetail(getRouterParam(event, 'id'))
)
