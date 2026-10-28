import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readPortfolioTeamMembers } from '../../../../../portfolio/server/team/read.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readPortfolioTeamMembers(event, {
    portfolioId: String(getQuery(event).portfolioId || ''),
  })
})
