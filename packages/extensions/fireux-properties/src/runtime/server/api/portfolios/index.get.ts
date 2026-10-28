import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readPortfolioDirectoryPage } from '../../../portfolio/server/index/read'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readPortfolioDirectoryPage(getQuery(event).cursor)
})
