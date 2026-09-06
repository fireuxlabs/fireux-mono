import { defineEventHandler, setResponseHeader } from 'h3'
import { readMiseboxProductContext } from '../../../app/context/read'
export default defineEventHandler((event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  return readMiseboxProductContext(event)
})
