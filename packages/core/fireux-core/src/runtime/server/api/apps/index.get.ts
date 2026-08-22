import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import type { App } from '../../../app/models/app.model'
import type { CollectionResponse } from '../../../models/utils/directory'
import { getRuntimeFirestore } from '../../utils/getRuntimeFirestore'

export default defineEventHandler(async (event: H3Event) => {
  const cfg = useFireUXConfig()
  const ecosystemId = String(cfg.ecosystemId || '').trim()

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  if (!ecosystemId) {
    const empty: CollectionResponse<App> = {
      ok: true,
      count: 0,
      generatedAt: new Date().toISOString(),
      items: [],
    }
    return empty
  }

  const db = getRuntimeFirestore()
  const snap = await db
    .collection('apps')
    .where('ecosystem_id', '==', ecosystemId)
    .get()

  const apps = snap.docs
    .map((doc) => ({ ...doc.data(), id: doc.id }) as App)
    .sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')))

  const response: CollectionResponse<App> = {
    ok: true,
    count: apps.length,
    generatedAt: new Date().toISOString(),
    items: apps,
  }

  return response
})
