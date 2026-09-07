import { defineEventHandler, readBody } from 'h3'
import { createBlankTeamMember } from '../../../../utils/blank/team/create.ts'

export default defineEventHandler(async (event) =>
  createBlankTeamMember(event, await readBody(event))
)
