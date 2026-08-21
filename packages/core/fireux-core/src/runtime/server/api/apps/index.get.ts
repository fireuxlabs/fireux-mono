import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import type { AppDirectoryEntry } from '../../../models/utils/directory'
import type { CollectionResponse } from '../../../models/utils/directory'
import { AppStorage } from '../../../app/models/app.model.ts'
import { getRuntimeFirestore } from '../../utils/getRuntimeFirestore'
import {
  projectAppDetail,
  toAppDirectoryEntry,
} from '../../../app/server/index/projection.ts'
import { asTrimmedString } from '../../utils/projection/normalize'

export default defineEventHandler(async (event: H3Event) => {
  const cfg = useFireUXConfig()
  const ecosystemId = String(cfg.ecosystemId || '').trim()

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  if (!ecosystemId) {
    const empty: CollectionResponse<AppDirectoryEntry> = {
      ok: true,
      count: 0,
      generatedAt: new Date().toISOString(),
      items: [],
    }
    return empty
  }

  const db = getRuntimeFirestore()
  const snap = await db
    .collection(AppStorage.collection)
    .where('ecosystem_id', '==', ecosystemId)
    .get()

  const apps = snap.docs
    .filter((doc) => asTrimmedString(doc.data()?.status) === 'active')
    .map((doc) => {
      const app = projectAppDetail(doc.data(), { id: doc.id })
      return app ? toAppDirectoryEntry(app) : null
    })
    .filter((app) => app !== null)
    .sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')))

  const response: CollectionResponse<AppDirectoryEntry> = {
    ok: true,
    count: apps.length,
    generatedAt: new Date().toISOString(),
    items: apps,
  }

  return response
})
