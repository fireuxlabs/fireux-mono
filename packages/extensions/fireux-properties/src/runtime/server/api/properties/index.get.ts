import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readPropertyDirectoryPage } from '../../../property/server/index/read'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readPropertyDirectoryPage(getQuery(event))
})
