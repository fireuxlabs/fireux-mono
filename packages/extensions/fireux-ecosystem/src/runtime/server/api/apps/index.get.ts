import {
  defineEventHandler,
  setResponseHeader,
  getQuery,
  setResponseHeaders,
} from 'h3'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  appCollectionPage,
  readAppPageInput,
  readAppRecords,
} from 'fireux-core/runtime/app/server/collection/read'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const { ecosystemId } = useFireUXConfig(event)
  const { limit, cursor } = readAppPageInput(getQuery(event))
  setResponseHeaders(event, { 'Cache-Control': 'no-store' })
  if (!ecosystemId) return appCollectionPage([])
  const items = await readAppRecords(getRuntimeFirestore(), {
    ecosystemId,
    activeOnly: true,
    limit: limit + 1,
    cursor,
  })
  return appCollectionPage(items, limit)
})
