import { defineEventHandler, setResponseHeader, getRouterParam } from 'h3'

import { readPortfolioDetail } from '../../../portfolio/server/index/read'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readPortfolioDetail(getRouterParam(event, 'id'))
})
