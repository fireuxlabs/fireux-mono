import { defineEventHandler, readBody } from 'h3'
import { createProject } from '../../../utils/project-mutations'

export default defineEventHandler(async (event) =>
  createProject(event, await readBody(event))
)
