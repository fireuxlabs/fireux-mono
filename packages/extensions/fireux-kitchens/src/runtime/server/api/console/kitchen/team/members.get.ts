import { defineEventHandler, getQuery } from 'h3'
import { readKitchenTeamMembers } from '../../../../kitchen/team/read.ts'

export default defineEventHandler((event) =>
  readKitchenTeamMembers(event, {
    kitchenId: String(getQuery(event).kitchenId || ''),
  })
)
