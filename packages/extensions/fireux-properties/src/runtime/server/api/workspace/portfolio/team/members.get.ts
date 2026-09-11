import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { readPortfolioTeamMembers } from '../../../../../portfolio/server/team/read.ts'

export default defineLiveReadHandler((event) =>
  readPortfolioTeamMembers(event, {
    portfolioId: String(getQuery(event).portfolioId || ''),
  })
)
