import { defineEventHandler, getQuery } from 'h3'
import { readBlankTeamMembers } from '../../../../utils/blank/team/read.ts'

export default defineEventHandler((event) =>
  readBlankTeamMembers(event, {
    blankId: String(getQuery(event).blankId || ''),
  })
)
