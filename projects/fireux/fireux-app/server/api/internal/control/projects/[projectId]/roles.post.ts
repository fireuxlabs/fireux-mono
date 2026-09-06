import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseHeader,
} from 'h3'
import { projectRoles } from '../../../../../project/team/roles'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return projectRoles(
    event,
    getRouterParam(event, 'projectId'),
    await readBody(event)
  )
})
