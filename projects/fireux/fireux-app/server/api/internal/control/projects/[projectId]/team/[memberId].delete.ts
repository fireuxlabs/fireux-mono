import { defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { deactivateProjectTeamMember } from '../../../../../../project/team/delete'

export default defineEventHandler(async (event) => {
  const response = await deactivateProjectTeamMember(
    event,
    getRouterParam(event, 'projectId'),
    getRouterParam(event, 'memberId')
  )
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
