import { defineEventHandler, readBody, setResponseHeaders } from 'h3'
import { readChatSession } from '../../utils/chat/session'

export default defineEventHandler(async (event) => {
  const response = await readChatSession(event, await readBody(event))
  setResponseHeaders(event, {
    'Cache-Control': 'private, no-store',
    'Content-Type': 'application/json; charset=utf-8',
  })
  return response
})
