import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseHeaders,
} from 'h3'
import { createProjectTeamMember } from '../../../../../project/team/create'

export default defineEventHandler(async (event) => {
  const response = await createProjectTeamMember(
    event,
    getRouterParam(event, 'projectId'),
    await readBody(event)
  )
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
