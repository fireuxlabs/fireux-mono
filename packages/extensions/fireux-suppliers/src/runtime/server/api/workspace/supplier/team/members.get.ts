import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { readSupplierTeamMembers } from '../../../../../supplier/server/team/read.ts'

export default defineLiveReadHandler((event) =>
  readSupplierTeamMembers(event, {
    supplierId: String(getQuery(event).supplierId || ''),
  })
)
