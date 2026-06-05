import { defineEventHandler, setResponseStatus } from 'h3'
import { setSproochliToolHeaders } from '../../../utils/sproochliTools'

export default defineEventHandler((event) => {
  setSproochliToolHeaders(event)
  setResponseStatus(event, 204)
  return ''
})
