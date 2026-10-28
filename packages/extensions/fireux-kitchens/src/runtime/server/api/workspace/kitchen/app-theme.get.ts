import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readKitchenAppTheme } from '../../../../kitchen/server/identity/app-theme.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readKitchenAppTheme(event, getQuery(event).kitchen_id)
})
