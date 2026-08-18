import { defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { readProjectTeam } from '../../../../../project/team/read'

export default defineEventHandler(async (event) => {
  const response = await readProjectTeam(
    event,
    getRouterParam(event, 'projectId')
  )
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
