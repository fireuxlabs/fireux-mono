import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { readSource } from '../../../menu-express/sources'
export default defineEventHandler(async (event) =>
  readSource(event, getRouterParam(event, 'id'), await readBody(event))
)
