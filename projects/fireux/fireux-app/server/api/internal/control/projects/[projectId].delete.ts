import { defineEventHandler, getRouterParam } from 'h3'
import { deleteProject } from '../../../../utils/project-mutations'

export default defineEventHandler(async (event) =>
  deleteProject(event, getRouterParam(event, 'projectId'))
)
