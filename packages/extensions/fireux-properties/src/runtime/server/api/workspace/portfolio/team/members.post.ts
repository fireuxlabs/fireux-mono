import { defineEventHandler, readBody } from 'h3'
import { createPortfolioTeamMember } from '../../../../../portfolio/server/team/create.ts'

export default defineEventHandler(async (event) =>
  createPortfolioTeamMember(event, await readBody(event))
)
