import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { askMiseboxProductContext } from '../../../app/context/ask'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  return askMiseboxProductContext(event, await readBody(event))
})
