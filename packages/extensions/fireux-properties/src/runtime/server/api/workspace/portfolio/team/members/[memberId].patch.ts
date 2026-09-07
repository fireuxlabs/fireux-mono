import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updatePortfolioTeamMember } from '../../../../../../portfolio/server/team/update.ts'

export default defineEventHandler(async (event) =>
  updatePortfolioTeamMember(event, {
    ...(await readBody(event)),
    memberId: getRouterParam(event, 'memberId') || '',
  })
)
