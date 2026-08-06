import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateProject } from '../../../../utils/project-mutations'

export default defineEventHandler(async (event) =>
  updateProject(
    event,
    getRouterParam(event, 'projectId'),
    await readBody(event)
  )
)
