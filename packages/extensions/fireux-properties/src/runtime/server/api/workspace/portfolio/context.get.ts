import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { portfolioContext } from '../../../../portfolio/server/context'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return portfolioContext(event, getQuery(event))
})
