import { defineEventHandler, getRouterParam, setResponseHeader } from 'h3'
import { readProjectAppContext } from '../../../../../project/index/app-context'
export default defineEventHandler((event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  return readProjectAppContext(event, getRouterParam(event, 'projectId'))
})
