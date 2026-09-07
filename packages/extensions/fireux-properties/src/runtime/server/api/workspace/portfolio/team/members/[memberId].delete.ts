import { defineEventHandler, getQuery, getRouterParam } from 'h3'
import { deletePortfolioTeamMember } from '../../../../../../portfolio/server/team/delete.ts'

export default defineEventHandler((event) =>
  deletePortfolioTeamMember(event, {
    portfolioId: String(getQuery(event).portfolioId || ''),
    memberId: getRouterParam(event, 'memberId') || '',
  })
)
