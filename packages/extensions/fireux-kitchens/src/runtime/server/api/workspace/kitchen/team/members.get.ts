import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readKitchenTeamMembers } from '../../../../../kitchen/server/team/read.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readKitchenTeamMembers(event, {
    kitchenId: String(getQuery(event).kitchenId || ''),
  })
})
