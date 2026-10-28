import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readBlankTeamMembers } from '../../../../utils/blank/team/read.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readBlankTeamMembers(event, {
    blankId: String(getQuery(event).blankId || ''),
  })
})
