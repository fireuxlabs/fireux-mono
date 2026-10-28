import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { listJobApplications } from '../../../job/server/hiring/index.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const query = getQuery(event)
  return listJobApplications(event, query.scope)
})
