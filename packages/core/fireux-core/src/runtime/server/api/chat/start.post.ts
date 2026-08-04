import { defineEventHandler, readBody, setResponseHeaders } from 'h3'
import { startChatSession } from '../../utils/chat/session'

export default defineEventHandler(async (event) => {
  const response = await startChatSession(event, await readBody(event))
  setResponseHeaders(event, {
    'Cache-Control': 'private, no-store',
    'Content-Type': 'application/json; charset=utf-8',
  })
  return response
})
