import { defineEventHandler, setResponseHeader } from 'h3'

import { readUserNotifications } from '../../../../user/server/notifications/read'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readUserNotifications(event)
})
