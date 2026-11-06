import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { createProjectApp } from 'fireux-fireux/runtime/platform/project-apps'
export default defineEventHandler(async (event) =>
  createProjectApp(
    event,
    getRouterParam(event, 'projectId'),
    await readBody(event)
  )
)
