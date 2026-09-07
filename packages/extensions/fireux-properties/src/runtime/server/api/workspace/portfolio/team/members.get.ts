import { defineEventHandler, getQuery } from 'h3'
import { readPortfolioTeamMembers } from '../../../../../portfolio/server/team/read.ts'

export default defineEventHandler((event) =>
  readPortfolioTeamMembers(event, {
    portfolioId: String(getQuery(event).portfolioId || ''),
  })
)
