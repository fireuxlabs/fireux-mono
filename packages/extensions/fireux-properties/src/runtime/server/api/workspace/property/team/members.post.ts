import { defineEventHandler, readBody } from 'h3'
import { createPropertyTeamMember } from '../../../../../property/server/team/create.ts'

export default defineEventHandler(async (event) =>
  createPropertyTeamMember(event, await readBody(event))
)
