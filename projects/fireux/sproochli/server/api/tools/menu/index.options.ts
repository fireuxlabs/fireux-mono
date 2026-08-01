import { defineEventHandler, setResponseStatus } from 'h3'
import {
  setSproochliPrivateToolHeaders,
} from '../../../utils/sproochliTools'

export default defineEventHandler((event) => {
  setSproochliPrivateToolHeaders(event)
  setResponseStatus(event, 204)
  return ''
})
