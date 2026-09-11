import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { readPropertyTeamMembers } from '../../../../../property/server/team/read.ts'

export default defineLiveReadHandler((event) =>
  readPropertyTeamMembers(event, {
    propertyId: String(getQuery(event).propertyId || ''),
  })
)
