import { defineEventHandler, getQuery, setResponseHeaders } from 'h3'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { appCollectionPage, readAppPageInput, readAppRecords } from '../../../app/server/collection/read'
import { getRuntimeFirestore } from '../../utils/getRuntimeFirestore'

export default defineEventHandler(async (event) => {
  const { ecosystemId } = useFireUXConfig(event)
  const { limit, cursor } = readAppPageInput(getQuery(event))
  setResponseHeaders(event, { 'Cache-Control': 'no-store' })
  if (!ecosystemId) return appCollectionPage([])
  const items = await readAppRecords(getRuntimeFirestore(), { ecosystemId, limit: limit + 1, cursor })
  return appCollectionPage(items, limit)
})
