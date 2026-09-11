import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { readKitchenTeamMembers } from '../../../../../kitchen/server/team/read.ts'

export default defineLiveReadHandler((event) =>
  readKitchenTeamMembers(event, {
    kitchenId: String(getQuery(event).kitchenId || ''),
  })
)
