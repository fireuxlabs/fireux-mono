import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { listJobApplications } from '../../../job/server/operations/hiring/index.ts'

export default defineLiveReadHandler((event) => {
  const query = getQuery(event)
  return listJobApplications(event, query.scope)
})
