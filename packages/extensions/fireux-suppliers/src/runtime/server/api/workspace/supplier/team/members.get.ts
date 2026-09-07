import { defineEventHandler, getQuery } from 'h3'
import { readSupplierTeamMembers } from '../../../../../supplier/server/team/read.ts'

export default defineEventHandler((event) =>
  readSupplierTeamMembers(event, {
    supplierId: String(getQuery(event).supplierId || ''),
  })
)
