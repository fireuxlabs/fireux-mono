import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { shareProductContext } from '../../../app/context/share'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  return shareProductContext(event, await readBody(event))
})
