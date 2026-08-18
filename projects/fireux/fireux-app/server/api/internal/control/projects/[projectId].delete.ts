import { defineEventHandler, getRouterParam } from 'h3'
import { deleteProject } from '../../../../project/identity/delete'

export default defineEventHandler(async (event) =>
  deleteProject(event, getRouterParam(event, 'projectId'))
)
