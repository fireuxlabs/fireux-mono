import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readPropertyTeamMembers } from '../../../../../property/server/team/read.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readPropertyTeamMembers(event, {
    propertyId: String(getQuery(event).propertyId || ''),
  })
})
