import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { readPropertyDirectoryPage } from '../../../property/server/index/read'

export default defineLiveReadHandler((event) =>
  readPropertyDirectoryPage(getQuery(event))
)
