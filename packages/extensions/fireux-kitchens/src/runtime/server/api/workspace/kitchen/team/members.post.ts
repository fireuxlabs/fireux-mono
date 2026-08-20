import { defineEventHandler, readBody } from 'h3'
import { createKitchenTeamMember } from '../../../../../kitchen/server/team/create.ts'

export default defineEventHandler(async (event) =>
  createKitchenTeamMember(event, await readBody(event))
)
