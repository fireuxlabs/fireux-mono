import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseHeaders,
} from 'h3'
import { updateProjectTeamMember } from 'fireux-fireux/runtime/project/server/team/update'

export default defineEventHandler(async (event) => {
  const response = await updateProjectTeamMember(
    event,
    getRouterParam(event, 'projectId'),
    getRouterParam(event, 'memberId'),
    await readBody(event)
  )
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
