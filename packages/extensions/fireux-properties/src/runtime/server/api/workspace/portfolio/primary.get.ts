import { defineEventHandler, setResponseHeaders } from 'h3'
import { readPortfolioWorkspacePrimary } from '../../../workspace/primary'

export default defineEventHandler(async (event) => {
  const response = await readPortfolioWorkspacePrimary(event)
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
