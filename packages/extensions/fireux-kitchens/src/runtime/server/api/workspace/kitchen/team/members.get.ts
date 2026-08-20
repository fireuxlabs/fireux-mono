import { defineEventHandler, getQuery } from 'h3'
import { readKitchenTeamMembers } from '../../../../../kitchen/server/team/read.ts'

export default defineEventHandler((event) =>
  readKitchenTeamMembers(event, {
    kitchenId: String(getQuery(event).kitchenId || ''),
  })
)
