import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateProjectIdentity } from 'fireux-projects/runtime/project/server/identity/update'

export default defineEventHandler(async (event) =>
  updateProjectIdentity(
    event,
    getRouterParam(event, 'projectId'),
    await readBody(event)
  )
)
