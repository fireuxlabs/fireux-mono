import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readSupplierTeamMembers } from '../../../../../supplier/server/team/read.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readSupplierTeamMembers(event, {
    supplierId: String(getQuery(event).supplierId || ''),
  })
})
