import { defineEventHandler, readBody } from 'h3'
import { createProject } from '../../../project/index/create'

export default defineEventHandler(async (event) =>
  createProject(event, await readBody(event))
)
