import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseHeader,
} from 'h3'
import { readRequest } from '../../../menu-express/read'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readRequest(event, getRouterParam(event, 'id'), await readBody(event))
})
