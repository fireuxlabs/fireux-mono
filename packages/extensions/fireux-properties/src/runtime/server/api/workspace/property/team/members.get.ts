import { defineEventHandler, getQuery } from 'h3'
import { readPropertyTeamMembers } from '../../../../../property/server/team/read.ts'

export default defineEventHandler((event) =>
  readPropertyTeamMembers(event, {
    propertyId: String(getQuery(event).propertyId || ''),
  })
)
