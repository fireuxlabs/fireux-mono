import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { readBlankTeamMembers } from '../../../../utils/blank/team/read.ts'

export default defineLiveReadHandler((event) =>
  readBlankTeamMembers(event, {
    blankId: String(getQuery(event).blankId || ''),
  })
)
