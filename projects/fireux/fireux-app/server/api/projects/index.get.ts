import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { readProjectDirectoryPage } from '../../project/index/directory'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300',
  })
  return readProjectDirectoryPage()
})
